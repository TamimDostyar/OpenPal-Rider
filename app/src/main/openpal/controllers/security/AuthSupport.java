package openpal.controllers.security;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;

@Component
public class AuthSupport {

    private final ProfileRepository profileRepo;
    private final JsonTokenWeb jsonTokenWeb;

    @Autowired
    public AuthSupport(ProfileRepository profileRepo, JsonTokenWeb jsonTokenWeb) {
        this.profileRepo = profileRepo;
        this.jsonTokenWeb = jsonTokenWeb;
    }

    public CreateProfileDB authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "missing or malformed Authorization header");
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        Claims claims;
        try {
            claims = jsonTokenWeb.parseClaims(token);
        } catch (JwtException e) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "invalid token");
        }
        String email = claims.getSubject();
        if (email == null || email.isBlank()) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "token missing subject");
        }
        CreateProfileDB profile = profileRepo.findByEmail(email)
                .orElseThrow(() -> new AuthFailure(HttpStatus.UNAUTHORIZED, "account not found"));

        Integer tokenVer = claims.get("ver", Integer.class);
        if (tokenVer == null || tokenVer != profile.getTokenVersion()) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "token has been revoked");
        }
        if (!profile.isEmailVerified()) {
            throw new AuthFailure(HttpStatus.FORBIDDEN, "email not verified");
        }
        return profile;
    }

    public static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }

    public static String emailDomain(String email) {
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "account email is malformed");
        }
        return email.substring(at + 1).toLowerCase();
    }

    public static class AuthFailure extends RuntimeException {
        public final HttpStatus status;
        public AuthFailure(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }
    }
}
