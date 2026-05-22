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

    /**
     * Shallow check that the submitted login fields are well-formed:
     * no field is null, the username is purely alphanumeric, and the email
     * ends in ".edu".
     *
     * Note this is a format check only — it does NOT verify credentials, and
     * it intentionally still accepts an empty username/password and an address
     * with no "@" (see LoginValidationTest for the documented gaps).
     */
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
