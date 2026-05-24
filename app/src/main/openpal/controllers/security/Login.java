package openpal.controllers.security;

/**
 * Request payload for POST /login-user. Also provides a shallow format check
 * on the submitted fields (alphanumeric username, .edu email).
 */
public class Login {
    private String username;
    private String email;
    private String password;

    public Login() {
    }

    public Login(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public String getUsername() {
        return this.username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isLoginDataValid() {
        if (username == null || email == null || password == null) {
            return false;
        }
        if (!username.matches("[A-Za-z0-9]*")) {
            return false;
        }
        return email.endsWith(".edu");
    }
}
