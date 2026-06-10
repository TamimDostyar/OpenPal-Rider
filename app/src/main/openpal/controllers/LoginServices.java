package openpal.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import openpal.services.security.JsonTokenWeb;
import openpal.dto.security.Login;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.LoginDB;
import openpal.database.account_mgt.ProfileRepository;

/**
 * HTTP endpoint for user login. Verifies credentials and issues a JWT
 * stamped with the account's current token version.
 */
@RestController
public class LoginServices {

    private final ProfileRepository profileRepository;
    private final JsonTokenWeb jsonTokenWeb;

    @Autowired
    public LoginServices(ProfileRepository profileRepository, JsonTokenWeb jsonTokenWeb) {
        this.profileRepository = profileRepository;
        this.jsonTokenWeb = jsonTokenWeb;
    }

    @PostMapping("/login-user")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody Login request) {
        Map<String, String> response = new HashMap<>();

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            response.put("error", "password is required");
            return ResponseEntity.badRequest().body(response);
        }

        String email = request.getEmail().trim();
        LoginDB loginDB = new LoginDB(request.getUsername(), email, request.getPassword());

        if (!loginDB.verifyLogin(profileRepository)) {
            response.put("error", "invalid email or password");
            return ResponseEntity.status(401).body(response);
        }

        CreateProfileDB profile = profileRepository.findByEmail(email).orElseThrow();
        String token = jsonTokenWeb.issueToken(email, profile.getTokenVersion());
        response.put("token", token);
        return ResponseEntity.ok(response);
    }
}
