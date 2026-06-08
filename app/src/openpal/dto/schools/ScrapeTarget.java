package openpal.dto.schools;

import java.util.List;

/**
 * Describes how to scrape one {@link Category}. A target is pure data — the
 * actual fetching/parsing lives in the scrape service.
 */
public sealed interface ScrapeTarget permits HtmlTarget, JsonTarget {
    List<String> endpoints();
}
