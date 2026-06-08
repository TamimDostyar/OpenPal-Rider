package openpal.dto.schools;

/**
 * One scraped result, ready to embed: the {@code text} (headline, dish, hours…),
 * an optional {@code link} to the source, and an optional {@code image} URL.
 * {@code link} and {@code image} are null when the source has none.
 */
public record ScrapeItem(String text, String link, String image) {
}
