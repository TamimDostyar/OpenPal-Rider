package openpal.dto.schools;

import java.util.List;

/**
 * One dish on today's menu: its {@code name}, a {@code price} (may be blank when
 * the item is free/unpriced) and any {@code dietary} labels (Vegan, Wheat/Gluten…).
 */
public record MenuDish(String name, String price, List<String> dietary) {
}
