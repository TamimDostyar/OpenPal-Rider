package openpal.services.schoolsScrape;

import java.util.List;

import openpal.dto.schools.MenuDaypart;


public interface MenuProvider {
    List<MenuDaypart> fetch();
}
