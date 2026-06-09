package openpal.dto.schools;

import java.util.List;

/** A serving station within a meal period (e.g. "Oneota Market") and its dishes. */
public record MenuStation(String name, List<MenuDish> items) {
}
