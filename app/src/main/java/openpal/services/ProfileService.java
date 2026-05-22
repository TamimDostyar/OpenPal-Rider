package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.profile.CreateProfile;
import openpal.controllers.security.SignupResult;
import openpal.controllers.security.SignupVerification;

/**
 * HTTP endpoints for the user signup flow. Wires URLs to the signup logic in
 * {@link SignupVerification} — all the actual work lives there.
 */
@RestController
@RequestMapping("api/user")
public class ProfileService {

    private final SignupVerification signupVerification;

    @Autowired
    public ProfileService(SignupVerification signupVerification) {
        this.signupVerification = signupVerification;
    }

    @PostMapping("/create-user")
    public ResponseEntity<Map<String, Object>> createProfile(@RequestBody CreateProfile request) {
        return toResponse(signupVerification.startSignup(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestBody Map<String, String> request) {
        return toResponse(signupVerification.verifyEmail(request.get("email"), request.get("code")));
    }

    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, Object>> resendCode(@RequestBody Map<String, String> request) {
        return toResponse(signupVerification.resendCode(request.get("email")));
    }

    private static ResponseEntity<Map<String, Object>> toResponse(SignupResult result) {
        return ResponseEntity.status(result.getStatus()).body(result.getBody());
    }
}
