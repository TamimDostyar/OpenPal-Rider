package openpal.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import openpal.dto.security.ForgotPassword;
import openpal.dto.security.ResetPassword;
import openpal.dto.security.SignupResult;
import openpal.services.security.ForgotPasswordSystem;

/**
 * HTTP endpoints for the password-reset flow. Delegates to
 * {@link ForgotPasswordSystem}, which issues one-time reset tokens (delivered by
 * email) and consumes them to set a new password hash on the account.
 */
@RestController
public class ForgotPasswordService {

    private final ForgotPasswordSystem forgotPasswordSystem;

    @Autowired
    public ForgotPasswordService(ForgotPasswordSystem forgotPasswordSystem) {
        this.forgotPasswordSystem = forgotPasswordSystem;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPassword request) {
        SignupResult result = forgotPasswordSystem.requestReset(request.getEmail());
        return ResponseEntity.status(result.getStatus()).body(result.getBody());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPassword request) {
        SignupResult result = forgotPasswordSystem.resetPassword(
            request.getToken(), request.getNewPassword());
        return ResponseEntity.status(result.getStatus()).body(result.getBody());
    }
}
