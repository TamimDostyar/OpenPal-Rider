package openpal.database.account_mgt;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Tests {@link LoginDB} - the credential-verification logic - against a mocked
 * repository. This is the real authentication path, so the adversarial cases
 * (wrong password, unknown user, null inputs) matter most.
 */
@ExtendWith(MockitoExtension.class)
class LoginDBTest {

    @Mock
    private ProfileRepository repo;

    private CreateProfileDB profileWithPassword(String email, String rawPassword) {
        return new CreateProfileDB("Test User", 1234, email,
                LocalDate.of(2000, 1, 1), "Adelphi University",
                LocalDate.of(2026, 5, 1), 1234567, PasswordHasher.hash(rawPassword));
    }

    @Test
    @DisplayName("isUserAvailable: true when the repository reports the email exists")
    void userAvailableWhenEmailExists() {
        when(repo.existsByEmail("a@x.edu")).thenReturn(true);
        assertTrue(new LoginDB("user", "a@x.edu", "pw").isUserAvailable(repo));
    }

    @Test
    @DisplayName("isUserAvailable: false when the repository reports no such email")
    void userNotAvailableWhenEmailMissing() {
        when(repo.existsByEmail("ghost@x.edu")).thenReturn(false);
        assertFalse(new LoginDB("user", "ghost@x.edu", "pw").isUserAvailable(repo));
    }

    @Test
    @DisplayName("isUserAvailable: a null or blank email short-circuits without hitting the DB")
    void userAvailableNullEmailSkipsRepository() {
        assertFalse(new LoginDB("user", null, "pw").isUserAvailable(repo));
        assertFalse(new LoginDB("user", "   ", "pw").isUserAvailable(repo));
        verifyNoInteractions(repo);
    }

    @Test
    @DisplayName("verifyLogin: succeeds only when the email exists AND the password matches")
    void verifyLoginSucceedsWithCorrectPassword() {
        when(repo.findByEmail("a@x.edu"))
                .thenReturn(Optional.of(profileWithPassword("a@x.edu", "Correct1!")));
        assertTrue(new LoginDB("user", "a@x.edu", "Correct1!").verifyLogin(repo));
    }

    @Test
    @DisplayName("verifyLogin: a wrong password is rejected even though the account exists")
    void verifyLoginRejectsWrongPassword() {
        when(repo.findByEmail("a@x.edu"))
                .thenReturn(Optional.of(profileWithPassword("a@x.edu", "Correct1!")));
        assertFalse(new LoginDB("user", "a@x.edu", "wrong-password").verifyLogin(repo));
        assertFalse(new LoginDB("user", "a@x.edu", "Correct1! ").verifyLogin(repo));
        assertFalse(new LoginDB("user", "a@x.edu", "correct1!").verifyLogin(repo));
    }

    @Test
    @DisplayName("verifyLogin: an unknown email is rejected")
    void verifyLoginRejectsUnknownEmail() {
        when(repo.findByEmail("ghost@x.edu")).thenReturn(Optional.empty());
        assertFalse(new LoginDB("user", "ghost@x.edu", "anything").verifyLogin(repo));
    }

    @Test
    @DisplayName("verifyLogin: null email or null password short-circuits without hitting the DB")
    void verifyLoginNullInputsSkipRepository() {
        assertFalse(new LoginDB("user", null, "pw").verifyLogin(repo));
        assertFalse(new LoginDB("user", "  ", "pw").verifyLogin(repo));
        assertFalse(new LoginDB("user", "a@x.edu", null).verifyLogin(repo));
        verify(repo, never()).findByEmail(any());
    }

    @Test
    @DisplayName("ATTACK: an empty password must never authenticate against a real hash")
    void verifyLoginRejectsEmptyPassword() {
        when(repo.findByEmail("a@x.edu"))
                .thenReturn(Optional.of(profileWithPassword("a@x.edu", "RealPassword9")));
        assertFalse(new LoginDB("user", "a@x.edu", "").verifyLogin(repo));
    }

    @Test
    @DisplayName("RISK: email lookup is case-sensitive, so 'A@X.EDU' will not find 'a@x.edu'")
    void verifyLoginIsCaseSensitiveOnEmail() {
        // findByEmail is an exact match. Combined with case-sensitive signup
        // uniqueness, the same person can end up locked out or duplicated.
        when(repo.findByEmail("A@X.EDU")).thenReturn(Optional.empty());
        assertFalse(new LoginDB("user", "A@X.EDU", "Correct1!").verifyLogin(repo));
    }
}
