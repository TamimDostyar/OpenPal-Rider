package openpal.logic;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import openpal.database.account_mgt.PasswordHasher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Security-critical: password hashing must be one-way, salted, and constant
 * enough that a leaked DB cannot be trivially reversed.
 */
class PasswordHasherTest {

    @Nested
    @DisplayName("hash()")
    class Hash {

        @Test
        @DisplayName("never stores the raw password in plaintext")
        void hashNeverEqualsRawPassword() {
            String raw = "Sup3rSecret!";
            String hash = PasswordHasher.hash(raw);
            assertNotEquals(raw, hash, "stored hash must not equal the raw password");
            assertFalse(hash.contains(raw), "hash must not embed the raw password");
        }

        @Test
        @DisplayName("produces a BCrypt-formatted hash ($2a$ / $2b$ / $2y$)")
        void hashIsBcryptShaped() {
            String hash = PasswordHasher.hash("anything");
            assertTrue(hash.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$"),
                    "expected a 60-char BCrypt hash, got: " + hash);
        }

        @Test
        @DisplayName("uses a random salt: same password hashes to two different values")
        void hashIsSalted() {
            String raw = "identicalPassword";
            assertNotEquals(PasswordHasher.hash(raw), PasswordHasher.hash(raw),
                    "two hashes of the same password must differ (random salt)");
        }

        @Test
        @DisplayName("hashes an empty string without throwing")
        void hashEmptyString() {
            assertDoesNotThrow(() -> PasswordHasher.hash(""));
        }

        @Test
        @DisplayName("ATTACK: BCrypt silently truncates input beyond 72 bytes")
        void bcryptSeventyTwoByteTruncation() {
            // BCrypt only consumes the first 72 bytes. Two long passwords that
            // share a 72-byte prefix collide. Documents a known BCrypt limit so
            // the team is aware before raising any max-length expectations.
            String prefix = "a".repeat(72);
            String hash = PasswordHasher.hash(prefix + "DIFFERENT-TAIL");
            assertTrue(PasswordHasher.matches(prefix + "anything-else-here", hash),
                    "passwords sharing a 72-byte prefix collide under BCrypt");
        }

        @Test
        @DisplayName("a null raw password throws rather than producing a usable hash")
        void hashNullThrows() {
            assertThrows(Exception.class, () -> PasswordHasher.hash(null));
        }
    }

    @Nested
    @DisplayName("matches()")
    class Matches {

        @Test
        @DisplayName("the correct password verifies against its hash")
        void correctPasswordMatches() {
            String raw = "correct horse battery staple";
            assertTrue(PasswordHasher.matches(raw, PasswordHasher.hash(raw)));
        }

        @Test
        @DisplayName("a wrong password is rejected")
        void wrongPasswordRejected() {
            String hash = PasswordHasher.hash("realPassword");
            assertFalse(PasswordHasher.matches("realPassword ", hash), "trailing space differs");
            assertFalse(PasswordHasher.matches("realpassword", hash), "case differs");
            assertFalse(PasswordHasher.matches("", hash), "empty differs");
        }

        @Test
        @DisplayName("null raw password or null stored hash returns false, never throws")
        void nullArgumentsReturnFalse() {
            String hash = PasswordHasher.hash("x");
            assertFalse(PasswordHasher.matches(null, hash));
            assertFalse(PasswordHasher.matches("x", null));
            assertFalse(PasswordHasher.matches(null, null));
        }

        @Test
        @DisplayName("a non-BCrypt stored value does not match and does not throw")
        void garbageStoredHashIsRejected() {
            // Defends against a DB column that somehow holds a plaintext password.
            assertFalse(PasswordHasher.matches("plaintext", "plaintext"));
        }

        @Test
        @DisplayName("unicode passwords round-trip correctly")
        void unicodePasswordRoundTrips() {
            String raw = "пароль🔐密码";
            assertTrue(PasswordHasher.matches(raw, PasswordHasher.hash(raw)));
        }
    }
}
