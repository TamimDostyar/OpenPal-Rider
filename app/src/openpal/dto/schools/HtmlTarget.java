package openpal.dto.schools;

import java.util.List;

/**
 * Scrape an HTML page. {@code item} selects each result container; the remaining
 * selectors pull fields out of that container (relative to it). A null sub-selector
 * means "not present": {@code text} falls back to the item's own text, while a null
 * {@code link}/{@code image} yields null.
 */
public record HtmlTarget(String item, String text, String link, String image,
                         List<String> endpoints) implements ScrapeTarget {
    public HtmlTarget(String item, String text, String link, String image, String... endpoints) {
        this(item, text, link, image, List.of(endpoints));
    }
}
