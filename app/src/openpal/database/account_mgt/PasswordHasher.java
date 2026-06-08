package openpal.database.account_mgt;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Static helpers that hash and verify user passwords with BCrypt. Used by
 * the signup, login, and password-reset flows to keep raw passwords off disk.
 */
public final class PasswordHasher {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private PasswordHasher() {
    }

    public static String hash(String rawPassword) {
        return ENCODER.encode(rawPassword);
    }

    public static boolean matches(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        return ENCODER.matches(rawPassword, storedHash);
    }
}
