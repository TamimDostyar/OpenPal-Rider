package openpal.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.security.JsonTokenWeb;
import openpal.controllers.security.Login;
import openpal.database.account_mgt.LoginDB;
import openpal.database.account_mgt.ProfileRepository;

@RestController
public class LoginServices {

    private final ProfileRepository profileRepository;
    private final JsonTokenWeb jsonTokenWeb = new JsonTokenWeb();

    @Autowired
    public LoginServices(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
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

        // verifyLogin checks the email exists AND the password matches the stored hash
        if (!loginDB.verifyLogin(profileRepository)) {
            response.put("error", "invalid email or password");
            return ResponseEntity.status(401).body(response);
        }

        String token = jsonTokenWeb.issueToken(email);
        response.put("token", token);
        return ResponseEntity.ok(response);
    }
}
