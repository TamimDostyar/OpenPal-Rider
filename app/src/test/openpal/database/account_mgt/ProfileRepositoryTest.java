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
                "Jane Doe", 4242, "jan034242", email,
                LocalDate.of(2002, 3, 14), "Adelphi University",
                LocalDate.of(2026, 6, 1), 5551234567L,
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
        assertEquals(5551234567L, loaded.getPhoneNumber());
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
    @DisplayName("phoneNumber is a Long column and round-trips a real 10-digit number")
    void phoneNumberHoldsRealTenDigitNumber() {
        // A US number like 5,551,234,567 exceeds Integer.MAX_VALUE (2,147,483,647);
        // the Long column must store and return it without truncation.
        long realNumber = 5_551_234_567L;
        CreateProfileDB profile = sampleProfile("phone@adelphi.edu");
        profile.setPhoneNumber(realNumber);

        CreateProfileDB saved = repo.saveAndFlush(profile);
        CreateProfileDB loaded = repo.findById(saved.getId()).orElseThrow();
        assertEquals(realNumber, loaded.getPhoneNumber(),
                "a real 10-digit phone number must survive the database round-trip");
    }
}
