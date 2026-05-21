package openpal.services;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// import logic
import openpal.controllers.profile.ProfileController;


@RestController
@RequestMapping("api/user")
public class ProfileService {
    private String name;
    ProfileController pc = new ProfileController(name);

    
    @GetMapping("/name-test")
    public Map<String, String> getUserData(){
        Map<String, String> data = new HashMap<String, String>();

        data.put("data", this.name);
        return data;
    }

}