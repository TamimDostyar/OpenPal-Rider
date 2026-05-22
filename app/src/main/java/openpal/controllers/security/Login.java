package openpal.controllers.security;

/**
 * Request payload for POST /login-user. Deserialized from the request body,
 * so it needs a no-arg constructor and public accessors for Jackson.
 */
public class Login {
    private String username;
    private String email;
    private String password;

    // required for JSON deserialization
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
}
