package openpal.controllers.profile;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

/**
 * Tests for {@link ProfileController}. Lives in the controllers.profile package
 * to reach the package-private {@code isValidPerson()}.
 */
class ProfileControllerTest {

    @RepeatedTest(2000)
    @DisplayName("numberGenerator() always returns a 4-digit number in [1000, 9999]")
    void numberGeneratorStaysInRange() {
        int n = ProfileController.numberGenerator();
        assertTrue(n >= 1000 && n <= 9999, "out of range: " + n);
    }

    @Test
    @DisplayName("numberGenerator() actually reaches both ends of its range over many draws")
    void numberGeneratorCoversItsRange() {
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < 200_000; i++) {
            int n = ProfileController.numberGenerator();
            min = Math.min(min, n);
            max = Math.max(max, n);
        }
        // Probabilistic, but with 200k draws over 9000 values this is effectively certain.
        assertTrue(min < 1100, "never produced a low value, min=" + min);
        assertTrue(max > 9900, "never produced a high value, max=" + max);
    }

    @Test
    @DisplayName("BUG: isValidPerson() uses '==' for String comparison, so a name "
            + "that only matches after lowercasing is rejected")
    void bugIsValidPersonReferenceComparison() {
        // "Tamim".toLowerCase() builds a NEW String; '== \"tamim\"' compares
        // references, not contents, so this returns false even though the
        // person clearly is "tamim". The check should use .equals().
        assertFalse(new ProfileController("Tamim").isValidPerson(),
                "isValidPerson is broken by reference equality - should use .equals()");
    }

    @Test
    @DisplayName("a name that is not 'tamim' is not a valid person")
    void unknownNameIsNotValid() {
        assertFalse(new ProfileController("Alice").isValidPerson());
        assertFalse(new ProfileController("").isValidPerson());
    }

    @Test
    @DisplayName("BUG: isValidPerson() throws NullPointerException on a null name")
    void bugIsValidPersonNullName() {
        // Constructor accepts a null name; isValidPerson() then dereferences it.
        assertThrows(NullPointerException.class,
                () -> new ProfileController(null).isValidPerson());
    }
}
