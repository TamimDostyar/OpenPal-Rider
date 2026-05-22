package openpal.controllers.security;

/**
 * Request payload for POST /forgot-password. Deserialized from the request body,
 * so it needs a no-arg constructor and public accessors for Jackson.
 */
public class ForgotPassword {
    private String email;

    // required for JSON deserialization
    public ForgotPassword() {
    }

    public ForgotPassword(String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
