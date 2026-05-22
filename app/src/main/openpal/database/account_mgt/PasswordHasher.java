package openpal.database.account_mgt;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Hashes and verifies passwords with BCrypt.
public final class PasswordHasher {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private PasswordHasher() {
    }

    // turns a raw password into a salted BCrypt hash for storage
    public static String hash(String rawPassword) {
        return ENCODER.encode(rawPassword);
    }

    // true if the raw password matches a previously stored hash
    public static boolean matches(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        return ENCODER.matches(rawPassword, storedHash);
    }
}
