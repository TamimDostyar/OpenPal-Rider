package openpal.services.security;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import openpal.dto.security.SignupResult;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.PasswordHasher;
import openpal.database.account_mgt.ProfileRepository;
import openpal.services.EmailService;


@Component
public class ForgotPasswordSystem {

    private static final long TOKEN_VALID_MINUTES = 30;

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ProfileRepository profileRepository;
    private final EmailService emailService;

    @Autowired
    public ForgotPasswordSystem(ProfileRepository profileRepository, EmailService emailService) {
        this.profileRepository = profileRepository;
        this.emailService = emailService;
    }

    public SignupResult requestReset(String email) {
        if (email == null || email.isBlank()) {
            return SignupResult.error(400, "email is required");
        }
        String trimmed = email.trim();
        if (!SignupVerification.isEduEmail(trimmed)) {
            return SignupResult.error(400, "email is not supported; it must be a .edu address");
        }

        Optional<CreateProfileDB> profile = profileRepository.findByEmail(trimmed);
        if (profile.isPresent()) {
            CreateProfileDB user = profile.get();
            String token = generateToken();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES));
            profileRepository.save(user);
            emailService.sendPasswordResetToken(user.getEmail(), token);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "if an account exists for that email, a reset token has been sent");
        return SignupResult.ok(200, response);
    }

    public SignupResult resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            return SignupResult.error(400, "token is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            return SignupResult.error(400, "newPassword is required");
        }

        Optional<CreateProfileDB> profile = profileRepository.findByResetToken(token);
        if (profile.isEmpty()) {
            return SignupResult.error(400, "invalid or expired reset token");
        }

        CreateProfileDB user = profile.get();
        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return SignupResult.error(400, "invalid or expired reset token");
        }

        user.setPassword(PasswordHasher.hash(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        profileRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "password has been reset");
        return SignupResult.ok(200, response);
    }

    private static String generateToken() {
        byte[] bytes = new byte[4];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
