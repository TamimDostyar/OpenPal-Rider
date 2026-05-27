package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.profile.ProfileManager;

@RestController
@RequestMapping("api/profile")
public class MyProfileService {

    private final ProfileManager manager;

    @Autowired
    public MyProfileService(ProfileManager manager) {
        this.manager = manager;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.getMe(authHeader);
    }

    @PutMapping("/bio")
    public ResponseEntity<Map<String, Object>> updateBio(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        return manager.updateBio(authHeader, body);
    }
}
