package openpal.services.schoolsScrape;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import openpal.dto.schools.Category;
import openpal.dto.schools.HtmlTarget;
import openpal.dto.schools.JsonTarget;
import openpal.dto.schools.MenuDaypart;
import openpal.dto.schools.ScrapeItem;
import openpal.dto.schools.ScrapeTarget;
import openpal.util.Utils;

/**
 * Base for every school. A subclass only supplies configuration — a base URL
 * and a {@link ScrapeTarget} per {@link Category} — and gets the scrape methods
 * for free. Every call fetches fresh, so results reflect the live site.
 */
public class SchoolManager {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final String school;
    private final String baseUrl;
    private final Map<Category, ScrapeTarget> targets;
    private final MenuProvider menu;

    protected SchoolManager(String school, Map<Category, ScrapeTarget> targets) {
        this(school, targets, null);
    }

    protected SchoolManager(String school, Map<Category, ScrapeTarget> targets, MenuProvider menu) {
        this.school = school;
        this.baseUrl = Utils.schoolUrl(school);
        this.targets = targets;
        this.menu = menu;
    }

    /** Canonical school name, matching a profile's {@code school} field. */
    public String school() { return school; }

    public List<ScrapeItem> scrapeNews()     { return scrape(Category.NEWS); }
    public List<ScrapeItem> scrapeGymHours() { return scrape(Category.GYM_HOURS); }
    public List<ScrapeItem> scrapeCafeHours() { return scrape(Category.CAFE_HOURS); }
    public List<ScrapeItem> scrapeLibrary()   { return scrape(Category.LIBRARY); }

    /**
     * Today's menu, grouped by meal period. Backed by whatever {@link MenuProvider}
     * the school wired up (Bon Appétit, etc.); empty for schools without one.
     */
    public List<MenuDaypart> scrapeMenu() {
        return menu == null ? List.of() : menu.fetch();
    }

    private List<ScrapeItem> scrape(Category category) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return List.of();
        }
        ScrapeTarget target = targets.get(category);
        if (target == null) {
            System.err.println(category + " is not configured for this school");
            return List.of();
        }

        List<ScrapeItem> output = new ArrayList<>();
        for (String endpoint : target.endpoints()) {
            try {
                output.addAll(fetch(endpoint, target));
            } catch (IOException e) {
                System.err.println("Failed to scrape " + endpoint + ": " + e.getMessage());
            }
        }
        return output;
    }

    private List<ScrapeItem> fetch(String endpoint, ScrapeTarget target) throws IOException {
        String url = endpoint.startsWith("http")
            ? endpoint
            : baseUrl.replaceAll("/$", "") + "/" + endpoint;

        String body = Jsoup.connect(url)
            .userAgent("Mozilla/5.0")
            .timeout(10000)
            .ignoreContentType(true)
            .execute()
            .body();

        return switch (target) {
            case HtmlTarget h -> parseHtml(body, url, h);
            case JsonTarget j -> parseJson(body, j);
        };
    }

    private List<ScrapeItem> parseHtml(String body, String baseUri, HtmlTarget target) {
        Document doc = Jsoup.parse(body, baseUri);
        List<ScrapeItem> results = new ArrayList<>();
        for (Element item : doc.select(target.item())) {
            String text = pick(item, target.text()) instanceof Element e ? e.text() : item.text();
            results.add(new ScrapeItem(text, absAttr(item, target.link(), "href"), absAttr(item, target.image(), "src")));
        }
        return results;
    }

    private List<ScrapeItem> parseJson(String body, JsonTarget target) throws IOException {
        JsonNode array = MAPPER.readTree(body).at(target.arrayPath());
        List<ScrapeItem> results = new ArrayList<>();
        for (JsonNode element : array) {
            List<String> parts = new ArrayList<>();
            for (String field : target.textFields()) {
                parts.add(element.path(field).asText());
            }
            results.add(new ScrapeItem(
                String.join(" ", parts),
                jsonField(element, target.linkField()),
                jsonField(element, target.imageField())));
        }
        return results;
    }

    private static Element pick(Element item, String selector) {
        return selector == null ? null : item.selectFirst(selector);
    }

    private static String absAttr(Element item, String selector, String attr) {
        Element el = pick(item, selector);
        return el == null ? null : el.absUrl(attr);
    }

    private static String jsonField(JsonNode element, String field) {
        return field == null ? null : element.path(field).asText(null);
    }
}
