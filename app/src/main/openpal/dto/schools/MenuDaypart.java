package openpal.dto.schools;

import java.util.List;

/**
 * One meal period of today's menu — e.g. Breakfast 07:30–10:45 — grouped into the
 * stations serving during it. Times are as published by the café (24h, may be blank).
 */
public record MenuDaypart(String label, String start, String end, List<MenuStation> stations) {
}
