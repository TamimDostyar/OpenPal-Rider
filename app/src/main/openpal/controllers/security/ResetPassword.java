package openpal.controllers.security;

/**
 * Request payload for POST /reset-password. Carries the one-time reset
 * token and the new password the user wants to set.
 */
public class ResetPassword {
    private String token;
    private String newPassword;

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
