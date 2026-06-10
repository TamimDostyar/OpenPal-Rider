package openpal.dto.security;


import openpal.services.security.SignupVerification;
import java.util.HashMap;
import java.util.Map;

/**
 * Result of a signup-flow step: an HTTP status paired with a response body.
 * Lets {@link SignupVerification} return outcomes without depending on HTTP types.
 */
public class SignupResult {

    private final int status;
    private final Map<String, Object> body;

    private SignupResult(int status, Map<String, Object> body) {
        this.status = status;
        this.body = body;
    }

    public static SignupResult error(int status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return new SignupResult(status, body);
    }

    public static SignupResult ok(int status, Map<String, Object> body) {
        return new SignupResult(status, body);
    }

    public int getStatus() { return this.status; }
    public Map<String, Object> getBody() { return this.body; }
}
