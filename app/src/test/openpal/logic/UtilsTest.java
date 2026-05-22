package openpal.logic;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import openpal.controllers.profile.Utils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Utils.isSchoolValid gates who is allowed to sign up, so it is an input-trust
 * boundary. These tests pin its behaviour against the bundled universities CSV.
 */
class UtilsTest {

    // a school known to exist in resources/data/us_universities.csv
    private static final String KNOWN_SCHOOL = "Adelphi University";

    @Test
    @DisplayName("a recognized US university is accepted")
    void knownSchoolIsValid() {
        assertTrue(Utils.isSchoolValid(KNOWN_SCHOOL));
    }

    @Test
    @DisplayName("matching is case-insensitive")
    void matchingIsCaseInsensitive() {
        assertTrue(Utils.isSchoolValid(KNOWN_SCHOOL.toUpperCase()));
        assertTrue(Utils.isSchoolValid(KNOWN_SCHOOL.toLowerCase()));
        assertTrue(Utils.isSchoolValid("aDeLpHi UnIvErSiTy"));
    }

    @Test
    @DisplayName("surrounding whitespace is trimmed before matching")
    void surroundingWhitespaceTrimmed() {
        assertTrue(Utils.isSchoolValid("   " + KNOWN_SCHOOL + "  "));
        assertTrue(Utils.isSchoolValid("\t" + KNOWN_SCHOOL + "\n"));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t", "\n"})
    @DisplayName("null, empty, or blank input is rejected without throwing")
    void blankInputRejected(String input) {
        assertFalse(Utils.isSchoolValid(input));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Hogwarts School of Witchcraft",
            "Adelphi",                       // partial name must not match
            "Adelphi University of Nowhere", // superset must not match
            "University"
    })
    @DisplayName("unknown or partial school names are rejected (exact match required)")
    void unknownSchoolRejected(String input) {
        assertFalse(Utils.isSchoolValid(input));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Adelphi University'; DROP TABLE profiles;--",
            "<script>alert(1)</script>",
            "%' OR '1'='1",
            "../../../etc/passwd"
    })
    @DisplayName("ATTACK: injection / traversal payloads are treated as plain text and rejected")
    void maliciousInputIsHarmlesslyRejected(String payload) {
        assertDoesNotThrow(() -> Utils.isSchoolValid(payload));
        assertFalse(Utils.isSchoolValid(payload));
    }
}
