package openpal.controllers.security;

/**
 * Request payload for POST /forgot-password. Carries the email address of
 * the account the user wants to reset.
 */
public class ForgotPassword {
    private String email;

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
