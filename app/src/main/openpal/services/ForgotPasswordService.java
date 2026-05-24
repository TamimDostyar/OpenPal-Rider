package openpal.services;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.security.ForgotPassword;
import openpal.controllers.security.ResetPassword;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.PasswordHasher;
import openpal.database.account_mgt.ProfileRepository;

/**
 * HTTP endpoints for the password-reset flow. Issues one-time reset tokens
 * and consumes them to set a new password hash on the account.
 */
@RestController
public class ForgotPasswordService {

    private static final long TOKEN_VALID_MINUTES = 30;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ProfileRepository profileRepository;

    @Autowired
    public ForgotPasswordService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPassword request) {
        Map<String, String> response = new HashMap<>();

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<CreateProfileDB> profile = profileRepository.findByEmail(request.getEmail().trim());
        if (profile.isPresent()) {
            CreateProfileDB user = profile.get();
            String token = generateToken();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES));
            profileRepository.save(user);

            response.put("resetToken", token);
        }

        response.put("message", "if an account exists for that email, a reset token has been issued");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPassword request) {
        Map<String, String> response = new HashMap<>();

        if (request.getToken() == null || request.getToken().isBlank()) {
            response.put("error", "token is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            response.put("error", "newPassword is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<CreateProfileDB> profile = profileRepository.findByResetToken(request.getToken());
        if (profile.isEmpty()) {
            response.put("error", "invalid or expired reset token");
            return ResponseEntity.status(400).body(response);
        }

        CreateProfileDB user = profile.get();
        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            response.put("error", "invalid or expired reset token");
            return ResponseEntity.status(400).body(response);
        }

        user.setPassword(PasswordHasher.hash(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        profileRepository.save(user);

        response.put("message", "password has been reset");
        return ResponseEntity.ok(response);
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
