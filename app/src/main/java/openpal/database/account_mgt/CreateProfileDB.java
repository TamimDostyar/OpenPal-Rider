package openpal.database.account_mgt;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "profiles")
public class CreateProfileDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private Integer userSpecialNumber;

    // server-generated handle: first 3 letters of name + birth month + special number
    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private LocalDate dob;
    private String school;
    private LocalDate graduationDate;
    private Integer phoneNumber;

    // BCrypt hash of the user's password — never the raw password
    private String password;

    // one-time password-reset token and its expiry; null when no reset is pending
    @Column(unique = true)
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    @ColumnDefault("false")
    private boolean emailVerified = false;

    // required by JPA
    protected CreateProfileDB() {
    }

    public CreateProfileDB(String name, Integer userSpecialNumber, String username, String email,
                           LocalDate dob, String school, LocalDate graduationDate,
                           Integer phoneNumber, String password) {
        this.name = name;
        this.userSpecialNumber = userSpecialNumber;
        this.username = username;
        this.email = email;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
        this.phoneNumber = phoneNumber;
        this.password = password;
    }

    // getters and setters
    public UUID getId() {
        return this.id;
    }
    public String getName() {
        return this.name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Integer getUserSpecialNumber() {
        return this.userSpecialNumber;
    }
    public void setUserSpecialNumber(Integer userSpecialNumber) {
        this.userSpecialNumber = userSpecialNumber;
    }
    public String getUsername() {
        return this.username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getEmail() {
        return this.email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public LocalDate getDob() {
        return this.dob;
    }
    public void setDob(LocalDate dob) {
        this.dob = dob;
    }
    public String getSchool() {
        return this.school;
    }
    public void setSchool(String school) {
        this.school = school;
    }
    public LocalDate getGraduationDate() {
        return this.graduationDate;
    }
    public void setGraduationDate(LocalDate graduationDate) {
        this.graduationDate = graduationDate;
    }
    public Integer getPhoneNumber() {
        return this.phoneNumber;
    }
    public void setPhoneNumber(Integer phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public String getPassword() {
        return this.password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getResetToken() {
        return this.resetToken;
    }
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    public LocalDateTime getResetTokenExpiry() {
        return this.resetTokenExpiry;
    }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    public boolean isEmailVerified() {
        return this.emailVerified;
    }
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
