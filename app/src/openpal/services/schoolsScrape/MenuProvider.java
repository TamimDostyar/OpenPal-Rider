package openpal.services.schoolsScrape;

import java.util.List;

import openpal.dto.schools.MenuDaypart;

/**
 * Supplies a school's menu, grouped by meal period. Each dining vendor (Bon
 * Appétit, Sodexo…) gets its own implementation; a school wires up whichever one
 * matches its café. The base {@link SchoolManager} stays vendor-agnostic — it
 * just calls {@link #fetch()} and never learns which site or format is behind it.
 */
public interface MenuProvider {
    List<MenuDaypart> fetch();
}
