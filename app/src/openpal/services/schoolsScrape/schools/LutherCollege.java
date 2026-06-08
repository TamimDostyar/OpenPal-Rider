package openpal.services.schoolsScrape.schools;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import openpal.dto.schools.Category;
import openpal.dto.schools.HtmlTarget;
import openpal.dto.schools.JsonTarget;
import openpal.services.schoolsScrape.SchoolManager;

@Component
public class LutherCollege extends SchoolManager {

    public LutherCollege() {
        super("Luther College", Map.of(
            Category.NEWS, new HtmlTarget(".news__item", ".news__title a", ".news__title a", ".news__image img",
                "news", "news/page/2", "news/page/3"),
            Category.GYM_HOURS, new HtmlTarget("p:contains(Hours)", null, null, null,
                "https://luthernorse.com/facilities/legends-fitness-for-life-center/11"),
            Category.MEAL, new HtmlTarget(".site-panel__daypart-item-title", null, null, null,
                "https://luther.cafebonappetit.com/"),

            Category.LIBRARY, new JsonTarget("/locations", List.of("name", "day", "rendered"), "url", null,
                "https://luther.libcal.com/api_hours_today.php?lid=0&format=json&systemTime=0")
        ));
    }
}
