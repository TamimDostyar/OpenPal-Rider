package openpal.services.schoolsScrape;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import openpal.dto.schools.MenuDaypart;
import openpal.dto.schools.MenuDish;
import openpal.dto.schools.MenuStation;

/**
 * {@link MenuProvider} for any Bon Appétit café site (e.g. luther.cafebonappetit.com) —
 * a school supplies its café URL and gets the menu for free. The page renders its meal
 * accordions collapsed, but embeds the full menu as JS: {@code Bamco.menu_items} maps
 * each item id to its label/price/allergens, and each {@code Bamco.dayparts['n']} lists
 * the meal period, its hours, and the stations (each a list of item ids). We pull both,
 * then resolve ids into a grouped menu.
 */
public final class BonAppetitMenu implements MenuProvider {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern DAYPART = Pattern.compile("Bamco\\.dayparts\\['(\\w+)'\\] = \\{");

    private final String cafeUrl;

    public BonAppetitMenu(String cafeUrl) {
        this.cafeUrl = cafeUrl;
    }

    @Override
    public List<MenuDaypart> fetch() {
        try {
            String html = Jsoup.connect(cafeUrl)
                .userAgent("Mozilla/5.0")
                .timeout(10000)
                .ignoreContentType(true)
                .execute()
                .body();
            return parse(html);
        } catch (IOException e) {
            System.err.println("Failed to fetch café menu from " + cafeUrl + ": " + e.getMessage());
            return List.of();
        }
    }

    static List<MenuDaypart> parse(String html) {
        String itemsJson = extractObject(html, html.indexOf("Bamco.menu_items = "));
        if (itemsJson == null) {
            return List.of();
        }
        JsonNode items;
        try {
            items = MAPPER.readTree(itemsJson);
        } catch (IOException e) {
            return List.of();
        }

        List<MenuDaypart> dayparts = new ArrayList<>();
        Matcher m = DAYPART.matcher(html);
        while (m.find()) {
            String json = extractObject(html, m.start());
            if (json == null) {
                continue;
            }
            try {
                dayparts.add(toDaypart(MAPPER.readTree(json), items));
            } catch (IOException e) {
                System.err.println("Skipping unparseable daypart: " + e.getMessage());
            }
        }
        return dayparts;
    }

    private static MenuDaypart toDaypart(JsonNode dp, JsonNode items) {
        List<MenuStation> stations = new ArrayList<>();
        for (JsonNode st : dp.path("stations")) {
            List<MenuDish> dishes = new ArrayList<>();
            for (JsonNode id : st.path("items")) {
                JsonNode item = items.get(id.asText());
                if (item != null) {
                    dishes.add(toDish(item));
                }
            }
            stations.add(new MenuStation(st.path("label").asText(""), dishes));
        }
        return new MenuDaypart(
            dp.path("label").asText(""),
            dp.path("starttime").asText(""),
            dp.path("endtime").asText(""),
            stations);
    }

    private static MenuDish toDish(JsonNode item) {
        List<String> dietary = new ArrayList<>();
        JsonNode cor = item.path("cor_icon");
        if (cor.isObject()) {
            cor.forEach(label -> dietary.add(label.asText()));
        }
        return new MenuDish(
            item.path("label").asText(""),
            item.path("price").asText(""),
            dietary);
    }


    private static String extractObject(String html, int from) {
        if (from < 0) {
            return null;
        }
        int start = html.indexOf('{', from);
        if (start < 0) {
            return null;
        }
        int depth = 0;
        boolean inString = false, escaped = false;
        for (int i = start; i < html.length(); i++) {
            char c = html.charAt(i);
            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (c == '\\') {
                    escaped = true;
                } else if (c == '"') {
                    inString = false;
                }
            } else if (c == '"') {
                inString = true;
            } else if (c == '{') {
                depth++;
            } else if (c == '}' && --depth == 0) {
                return html.substring(start, i + 1);
            }
        }
        return null;
    }
}
