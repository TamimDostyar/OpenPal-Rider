package openpal.services;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// import logic
import openpal.controllers.profile.CreateProfile;
import openpal.controllers.profile.ProfileController;
import openpal.controllers.profile.Utils;
import openpal.controllers.security.GoogleStep;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.account_mgt.PasswordHasher;


@RestController
@RequestMapping("api/user")
public class ProfileService {

    // how long the emailed 4-digit verification code stays valid
    private static final long CODE_VALID_MINUTES = 10;

    private final ProfileRepository profileRepository;
    private final EmailService emailService;

    // signups awaiting code verification, keyed by lowercased email.
    // nothing here is in the database yet — a wrong/expired code means no account.
    private final Map<String, PendingRegistration> pending = new ConcurrentHashMap<>();

    @Autowired
    public ProfileService(ProfileRepository profileRepository, EmailService emailService) {
        this.profileRepository = profileRepository;
        this.emailService = emailService;
    }

    /**
     * Step 1 of signup: validate the request and email a 4-digit code.
     * The account is NOT created here — it only gets written to the database
     * once the user confirms the code via /verify-email.
     */
    @PostMapping("/create-user")
    public ResponseEntity<Map<String, Object>> createProfile(@RequestBody CreateProfile request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getName() == null || request.getName().isBlank()) {
            response.put("error", "name is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getPhoneNumber() == null){
            response.put("error", "phone number required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            response.put("error", "password is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (!Utils.isSchoolValid(request.getSchool())) {
            response.put("error", "school is not a recognized US university");
            return ResponseEntity.badRequest().body(response);
        }

        String email = request.getEmail().trim();

        // reject duplicate signups so emails stay unique
        if (profileRepository.existsByEmail(email)) {
            response.put("error", "an account with this email already exists");
            return ResponseEntity.status(409).body(response);
        }

        // server-assigned identifier for the new profile
        Integer specialNumber = ProfileController.numberGenerator();

        // server-generated username: first 3 letters of name + birth month + special number
        String username = ProfileController.generateUsername(
            request.getName(), request.getDob(), specialNumber);

        // Google-style step verification: email a 4-digit code; the signup is
        // parked in memory until that code is confirmed
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

        response.put("email", email);
        response.put("message", "a 4-digit verification code has been sent to your email; "
            + "confirm it at /api/user/verify-email to create your account");
        return ResponseEntity.status(202).body(response);
    }

    /**
     * Step 2 of signup: confirm the 4-digit code. Only on a correct,
     * unexpired code is the account actually created in the database.
     * A wrong code creates nothing — the user can retry until it expires.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email = request.get("email");
        String code = request.get("code");
        if (email == null || email.isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (code == null || code.isBlank()) {
            response.put("error", "code is required");
            return ResponseEntity.badRequest().body(response);
        }

        String key = email.trim().toLowerCase();
        PendingRegistration registration = pending.get(key);
        if (registration == null) {
            response.put("error", "no pending signup for that email; start again at /api/user/create-user");
            return ResponseEntity.status(404).body(response);
        }
        if (registration.isExpired()) {
            pending.remove(key);
            response.put("error", "verification code has expired; start again at /api/user/create-user");
            return ResponseEntity.status(400).body(response);
        }
        if (!registration.matches(code.trim())) {
            // wrong code — account is NOT created; pending signup is kept for retry
            response.put("error", "incorrect verification code");
            return ResponseEntity.status(400).body(response);
        }

        // someone may have registered this email while the code was outstanding
        if (profileRepository.existsByEmail(registration.getEmail())) {
            pending.remove(key);
            response.put("error", "an account with this email already exists");
            return ResponseEntity.status(409).body(response);
        }

        // code is correct — now (and only now) persist the account
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
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Re-sends a fresh 4-digit code for a pending signup, e.g. when the
     * previous code expired.
     */
    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, Object>> resendCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email = request.get("email");
        if (email == null || email.isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }

        String key = email.trim().toLowerCase();
        PendingRegistration existing = pending.get(key);
        if (existing == null) {
            response.put("error", "no pending signup for that email; start again at /api/user/create-user");
            return ResponseEntity.status(404).body(response);
        }

        // issue a new code, carrying over all the already-validated signup data
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

        response.put("message", "a new 4-digit verification code has been sent to your email");
        return ResponseEntity.ok(response);
    }
}
