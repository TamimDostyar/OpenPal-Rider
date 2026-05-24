package openpal.controllers.security;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A validated signup held in memory while awaiting email-code confirmation.
 * No account is written to the database until the user confirms the code.
 */
public class PendingRegistration {

    private final String name;
    private final Integer specialNumber;
    private final String username;
    private final String email;
    private final LocalDate dob;
    private final String school;
    private final LocalDate graduationDate;
    private final Long phoneNumber;
    private final String passwordHash;

    private final String code;
    private final LocalDateTime codeExpiry;

    public PendingRegistration(String name, Integer specialNumber, String username, String email,
                               LocalDate dob, String school, LocalDate graduationDate,
                               Long phoneNumber, String passwordHash,
                               String code, LocalDateTime codeExpiry) {
        this.name = name;
        this.specialNumber = specialNumber;
        this.username = username;
        this.email = email;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.code = code;
        this.codeExpiry = codeExpiry;
    }

    public boolean isExpired() {
        return codeExpiry == null || codeExpiry.isBefore(LocalDateTime.now());
    }

    public boolean matches(String candidate) {
        return code != null && code.equals(candidate);
    }

    public String getName() { return this.name; }
    public Integer getSpecialNumber() { return this.specialNumber; }
    public String getUsername() { return this.username; }
    public String getEmail() { return this.email; }
    public LocalDate getDob() { return this.dob; }
    public String getSchool() { return this.school; }
    public LocalDate getGraduationDate() { return this.graduationDate; }
    public Long getPhoneNumber() { return this.phoneNumber; }
    public String getPasswordHash() { return this.passwordHash; }
    public String getCode() { return this.code; }
    public LocalDateTime getCodeExpiry() { return this.codeExpiry; }
}
