package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.profile.AccountManager;
import openpal.controllers.profile.ProfileManager;

@RestController
@RequestMapping("api/profile")
public class MyProfileService {

    private final ProfileManager manager;
    private final AccountManager accountManager;

    @Autowired
    public MyProfileService(ProfileManager manager, AccountManager accountManager) {
        this.manager = manager;
        this.accountManager = accountManager;
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

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, Object>> deleteAccount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return accountManager.deleteAccount(authHeader);
    }
}
