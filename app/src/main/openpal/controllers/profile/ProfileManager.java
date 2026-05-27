package openpal.controllers.profile;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;

@Component
public class ProfileManager {

    private static final int BIO_MAX = 200;

    private final ProfileRepository profileRepo;
    private final AuthSupport auth;

    @Autowired
    public ProfileManager(ProfileRepository profileRepo, AuthSupport auth) {
        this.profileRepo = profileRepo;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> getMe(String authHeader) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        return ResponseEntity.ok(toBody(profile));
    }

    public ResponseEntity<Map<String, Object>> updateBio(String authHeader, Map<String, String> body) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        String raw = body == null ? null : body.get("bio");
        String bio = raw == null ? "" : raw.trim();
        if (bio.length() > BIO_MAX) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "bio must be " + BIO_MAX + " characters or fewer");
        }
        profile.setBio(bio.isEmpty() ? null : bio);
        profileRepo.save(profile);
        return ResponseEntity.ok(toBody(profile));
    }

    private static Map<String, Object> toBody(CreateProfileDB p) {
        Map<String, Object> body = new HashMap<>();
        body.put("username", p.getUsername());
        body.put("name", p.getName());
        body.put("email", p.getEmail());
        body.put("school", p.getSchool());
        body.put("bio", p.getBio());
        body.put("driverVerified", p.isDriverVerified());
        return body;
    }
}
