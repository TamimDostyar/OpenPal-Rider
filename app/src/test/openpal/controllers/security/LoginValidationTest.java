package openpal.controllers.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Tests for {@link Login#isLoginDataValid()}.
 *
 * Lives in package openpal.controllers.security to reach the package-private
 * {@code Login(String, String, String)} constructor.
 *
 * Several tests below are tagged BUG: they assert the CURRENT behaviour and
 * document where it is unsafe, so a future fix will visibly flip them.
 */
class LoginValidationTest {

    private Login login(String username, String email, String pwd) {
        return new Login(username, email, pwd);
    }

    @Test
    @DisplayName("a clean alphanumeric username with a .edu email is valid")
    void happyPath() {
        assertTrue(login("johndoe", "johndoe@harvard.edu", "pw").isLoginDataValid());
        assertTrue(login("user2024", "user@mit.edu", "pw").isLoginDataValid());
    }

    @ParameterizedTest
    @DisplayName("any null field makes the login data invalid")
    @org.junit.jupiter.params.provider.CsvSource(value = {
            "NULL,  a@x.edu, pw",
            "user,  NULL,    pw",
            "user,  a@x.edu, NULL"
    }, nullValues = "NULL")
    void nullFieldsAreInvalid(String username, String email, String pwd) {
        assertFalse(login(username, email, pwd).isLoginDataValid());
    }

    @ParameterizedTest
    @ValueSource(strings = {"john.doe", "john_doe", "john doe", "john@", "josé", "admin!"})
    @DisplayName("usernames containing non-alphanumeric characters are rejected")
    void nonAlphanumericUsernameRejected(String username) {
        assertFalse(login(username, "u@x.edu", "pw").isLoginDataValid());
    }

    @ParameterizedTest
    @ValueSource(strings = {"john@gmail.com", "john@harvard.education", "john@edu", "john@x.EDU"})
    @DisplayName("emails that do not end in lowercase .edu are rejected")
    void nonEduEmailRejected(String email) {
        assertFalse(login("john", email, "pw").isLoginDataValid());
    }

    @Test
    @DisplayName("BUG: an empty username is accepted as valid")
    void bugEmptyUsernameAccepted() {
        // "" matches no non-alphanumeric char, so the negated regex passes.
        // A login should require an actual username.
        assertTrue(login("", "someone@school.edu", "pw").isLoginDataValid(),
                "empty username currently passes validation - should be rejected");
    }

    @Test
    @DisplayName("BUG: a string with no '@' is accepted as long as it ends in .edu")
    void bugMalformedEmailAccepted() {
        // endsWith(\".edu\") alone is not email validation.
        assertTrue(login("attacker", "not-an-email.edu", "pw").isLoginDataValid(),
                "malformed address ending in .edu currently passes - needs real email validation");
    }

    @Test
    @DisplayName("BUG: an empty password is accepted (password content is never validated)")
    void bugEmptyPasswordAccepted() {
        assertTrue(login("john", "john@school.edu", "").isLoginDataValid(),
                "empty password currently passes validation");
    }
}
