package openpal.services;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("api/users/profile")
public class ProfileService {
    
    private String name = "Tamim";

    @GetMapping("/name-test")
    public Map<String, String> getUserData(){
        Map<String, String> data = new HashMap<String, String>();

        data.put("data", this.name);
        return data;
    }

}
