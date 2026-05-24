package openpal.controllers.security;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import openpal.controllers.profile.CreateProfile;
import openpal.controllers.profile.ProfileController;
import openpal.controllers.profile.Utils;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.PasswordHasher;
import openpal.database.account_mgt.ProfileRepository;
import openpal.services.EmailService;

/**
 * Two-step signup flow: validate a signup, email a 4-digit code, and persist
 * the account only once the user confirms that code.
 */
@Component
public class SignupVerification {

    private static final long CODE_VALID_MINUTES = 10;

    private final ProfileRepository profileRepository;
    private final EmailService emailService;

    private final Map<String, PendingRegistration> pending = new ConcurrentHashMap<>();

    @Autowired
    public SignupVerification(ProfileRepository profileRepository, EmailService emailService) {
        this.profileRepository = profileRepository;
        this.emailService = emailService;
    }

    public SignupResult startSignup(CreateProfile request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return SignupResult.error(400, "name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return SignupResult.error(400, "email is required");
        }
        if (request.getPhoneNumber() == null) {
            return SignupResult.error(400, "phone number required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return SignupResult.error(400, "password is required");
        }
        if (!Utils.isSchoolValid(request.getSchool())) {
            return SignupResult.error(400, "school is not a recognized US university");
        }

        String email = request.getEmail().trim();
        if (profileRepository.existsByEmail(email)) {
            return SignupResult.error(409, "an account with this email already exists");
        }

        Integer specialNumber = ProfileController.numberGenerator();
        String username = ProfileController.generateUsername(
            request.getName(), request.getDob(), specialNumber);

        String code = GoogleStep.generateCode();
        PendingRegistration registration = new PendingRegistration(
            request.getName().trim(),
            specialNumber,
            username,
            email,
            request.getDob(),
            request.getSchool().trim(),
            request.getGraduationDate(),
            request.getPhoneNumber(),
            PasswordHasher.hash(request.getPassword()),
            code,
            LocalDateTime.now().plusMinutes(CODE_VALID_MINUTES)
        );
        pending.put(email.toLowerCase(), registration);
        emailService.sendVerificationCode(email, code);

        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("message", "a 4-digit verification code has been sent to your email; "
            + "confirm it at /api/user/verify-email to create your account");
        return SignupResult.ok(202, response);
    }

    public SignupResult verifyEmail(String email, String code) {
        if (email == null || email.isBlank()) {
            return SignupResult.error(400, "email is required");
        }
        if (code == null || code.isBlank()) {
            return SignupResult.error(400, "code is required");
        }

        String key = email.trim().toLowerCase();
        PendingRegistration registration = pending.get(key);
        if (registration == null) {
            return SignupResult.error(404,
                "no pending signup for that email; start again at /api/user/create-user");
        }
        if (registration.isExpired()) {
            pending.remove(key);
            return SignupResult.error(400,
                "verification code has expired; start again at /api/user/create-user");
        }
        if (!registration.matches(code.trim())) {
            return SignupResult.error(400, "incorrect verification code");
        }
        if (profileRepository.existsByEmail(registration.getEmail())) {
            pending.remove(key);
            return SignupResult.error(409, "an account with this email already exists");
        }

        CreateProfileDB profile = new CreateProfileDB(
            registration.getName(),
            registration.getSpecialNumber(),
            registration.getUsername(),
            registration.getEmail(),
            registration.getDob(),
            registration.getSchool(),
            registration.getGraduationDate(),
            registration.getPhoneNumber(),
            registration.getPasswordHash()
        );
        profile.setEmailVerified(true);
        CreateProfileDB saved = profileRepository.save(profile);
        pending.remove(key);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("userSpecialNumber", saved.getUserSpecialNumber());
        response.put("username", saved.getUsername());
        response.put("email", saved.getEmail());
        response.put("dob", saved.getDob());
        response.put("school", saved.getSchool());
        response.put("graduationDate", saved.getGraduationDate());
        response.put("PhoneNumber", saved.getPhoneNumber());
        response.put("emailVerified", saved.isEmailVerified());
        response.put("message", "email verified; account created");
        return SignupResult.ok(201, response);
    }

    public SignupResult resendCode(String email) {
        if (email == null || email.isBlank()) {
            return SignupResult.error(400, "email is required");
        }

        String key = email.trim().toLowerCase();
        PendingRegistration existing = pending.get(key);
        if (existing == null) {
            return SignupResult.error(404,
                "no pending signup for that email; start again at /api/user/create-user");
        }

        String code = GoogleStep.generateCode();
        PendingRegistration refreshed = new PendingRegistration(
            existing.getName(),
            existing.getSpecialNumber(),
            existing.getUsername(),
            existing.getEmail(),
            existing.getDob(),
            existing.getSchool(),
            existing.getGraduationDate(),
            existing.getPhoneNumber(),
            existing.getPasswordHash(),
            code,
            LocalDateTime.now().plusMinutes(CODE_VALID_MINUTES)
        );
        pending.put(key, refreshed);
        emailService.sendVerificationCode(existing.getEmail(), code);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "a new 4-digit verification code has been sent to your email");
        return SignupResult.ok(200, response);
    }
}
