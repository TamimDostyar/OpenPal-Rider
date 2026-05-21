package openpal.database.account_mgt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Persistence-layer tests for {@link ProfileRepository}, run against an
 * in-memory H2 database (see src/test/resources/application.properties).
 */
@DataJpaTest
class ProfileRepositoryTest {

    @Autowired
    private ProfileRepository repo;

    private CreateProfileDB sampleProfile(String email) {
        return new CreateProfileDB(
                "Jane Doe", 4242, email,
                LocalDate.of(2002, 3, 14), "Adelphi University",
                LocalDate.of(2026, 6, 1), 1234567,
                PasswordHasher.hash("SuperSecret9!"));
    }

    @Test
    @DisplayName("a saved profile is assigned a non-null generated UUID id")
    void saveAssignsGeneratedId() {
        CreateProfileDB saved = repo.save(sampleProfile("jane@adelphi.edu"));
        assertNotNull(saved.getId(), "JPA should generate a UUID primary key");
    }

    @Test
    @DisplayName("all profile fields round-trip through the database unchanged")
    void allFieldsRoundTrip() {
        CreateProfileDB saved = repo.saveAndFlush(sampleProfile("roundtrip@adelphi.edu"));
        CreateProfileDB loaded = repo.findById(saved.getId()).orElseThrow();

        assertEquals("Jane Doe", loaded.getName());
        assertEquals(4242, loaded.getUserSpecialNumber());
        assertEquals("roundtrip@adelphi.edu", loaded.getEmail());
        assertEquals(LocalDate.of(2002, 3, 14), loaded.getDob());
        assertEquals("Adelphi University", loaded.getSchool());
        assertEquals(LocalDate.of(2026, 6, 1), loaded.getGraduationDate());
        assertEquals(1234567, loaded.getPhoneNumber());
        assertTrue(PasswordHasher.matches("SuperSecret9!", loaded.getPassword()),
                "the stored password must remain a verifiable BCrypt hash");
    }

    @Test
    @DisplayName("the stored password column holds a hash, never the raw password")
    void passwordIsStoredHashed() {
        CreateProfileDB saved = repo.saveAndFlush(sampleProfile("hash@adelphi.edu"));
        CreateProfileDB loaded = repo.findById(saved.getId()).orElseThrow();
        assertFalse(loaded.getPassword().contains("SuperSecret9!"),
                "raw password leaked into the database");
    }

    @Test
    @DisplayName("existsByEmail / findByEmail locate a saved profile")
    void lookupBySavedEmail() {
        repo.saveAndFlush(sampleProfile("found@adelphi.edu"));
        assertTrue(repo.existsByEmail("found@adelphi.edu"));

        Optional<CreateProfileDB> found = repo.findByEmail("found@adelphi.edu");
        assertTrue(found.isPresent());
        assertEquals("Jane Doe", found.get().getName());
    }

    @Test
    @DisplayName("existsByEmail / findByEmail return empty for an unknown email")
    void lookupUnknownEmail() {
        assertFalse(repo.existsByEmail("nobody@adelphi.edu"));
        assertTrue(repo.findByEmail("nobody@adelphi.edu").isEmpty());
    }

    @Test
    @DisplayName("the unique email constraint rejects a duplicate signup")
    void duplicateEmailIsRejected() {
        repo.saveAndFlush(sampleProfile("dup@adelphi.edu"));
        assertThrows(DataIntegrityViolationException.class,
                () -> repo.saveAndFlush(sampleProfile("dup@adelphi.edu")),
                "two profiles with the same email must not be allowed");
    }

    @Test
    @DisplayName("BUG: email uniqueness is case-sensitive - 'DUP@ADELPHI.EDU' bypasses it")
    void bugEmailUniquenessIsCaseSensitive() {
        // The email column is unique but compared case-sensitively, so the same
        // address in a different case is treated as a brand-new account.
        repo.saveAndFlush(sampleProfile("casetest@adelphi.edu"));
        assertFalse(repo.existsByEmail("CASETEST@ADELPHI.EDU"),
                "uppercase variant is not detected as a duplicate - emails should be normalized");
    }

    @Test
    @DisplayName("RISK: phoneNumber is an Integer column and cannot hold a real 10-digit number")
    void bugPhoneNumberFieldIsTooNarrow() {
        // A US number like 5551234567 is 5,551,234,567 > Integer.MAX_VALUE
        // (2,147,483,647). The schema simply cannot store most phone numbers;
        // phoneNumber should be a String (or Long at minimum).
        assertTrue(5_551_234_567L > Integer.MAX_VALUE,
                "real phone numbers overflow the Integer phoneNumber column");
    }
}
