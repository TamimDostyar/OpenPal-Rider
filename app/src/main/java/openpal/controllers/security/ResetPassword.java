package openpal.controllers.security;

/**
 * Request payload for POST /reset-password. Deserialized from the request body,
 * so it needs a no-arg constructor and public accessors for Jackson.
 */
public class ResetPassword {
    private String token;
    private String newPassword;

    // required for JSON deserialization
    public ResetPassword() {
    }

    public ResetPassword(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() {
        return this.token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return this.newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
