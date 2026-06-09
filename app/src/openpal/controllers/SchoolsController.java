package openpal.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.dto.schools.MenuDaypart;
import openpal.dto.schools.ScrapeItem;
import openpal.services.schoolsScrape.SchoolRegistry;

@RestController
@RequestMapping("/api/schools/{school}")
public class SchoolsController {

    private final SchoolRegistry registry;

    public SchoolsController(SchoolRegistry registry) {
        this.registry = registry;
    }

    @GetMapping("/news")
    public List<ScrapeItem> news(@PathVariable String school) {
        return registry.get(school).scrapeNews();
    }

    @GetMapping("/gym-hours")
    public List<ScrapeItem> gymHours(@PathVariable String school) {
        return registry.get(school).scrapeGymHours();
    }

    @GetMapping("/cafe-hours")
    public List<ScrapeItem> cafeHours(@PathVariable String school) {
        return registry.get(school).scrapeCafeHours();
    }

    @GetMapping("/menu")
    public List<MenuDaypart> menu(@PathVariable String school) {
        return registry.get(school).scrapeMenu();
    }

    @GetMapping("/library")
    public List<ScrapeItem> library(@PathVariable String school) {
        return registry.get(school).scrapeLibrary();
    }
}
