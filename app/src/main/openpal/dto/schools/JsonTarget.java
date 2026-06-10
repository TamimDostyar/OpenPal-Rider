package openpal.dto.schools;

import java.util.List;

/**
 * Scrape a JSON endpoint (e.g. a live hours API). For each element in the array
 * at {@code arrayPath} (a JSON pointer), the named fields map to a {@link ScrapeItem}.
 * {@code textFields} are joined with a space; {@code linkField}/{@code imageField}
 * may be null.
 */
public record JsonTarget(String arrayPath, List<String> textFields, String linkField, String imageField,
                         List<String> endpoints) implements ScrapeTarget {
    public JsonTarget(String arrayPath, List<String> textFields, String linkField, String imageField,
                      String... endpoints) {
        this(arrayPath, textFields, linkField, imageField, List.of(endpoints));
    }
}
