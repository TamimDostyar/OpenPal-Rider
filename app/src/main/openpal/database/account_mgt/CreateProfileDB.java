package openpal.database.account_mgt;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;


/**
 * JPA entity for a user profile in the "profiles" table. Holds identity,
 * credentials, email-verification status, and reset/token-version state.
 */
@Entity
@Table(name = "profiles")
public class CreateProfileDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private Integer userSpecialNumber;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private LocalDate dob;
    private String school;
    private LocalDate graduationDate;
    private Long phoneNumber;

    private String password;

    @Column(unique = true)
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    @ColumnDefault("false")
    private boolean emailVerified = false;

    @ColumnDefault("0")
    private int tokenVersion = 0;

    private String vehicleLicensePlate;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleColor;

    @ColumnDefault("false")
    private boolean driverVerified = false;

    protected CreateProfileDB() {
    }

    public CreateProfileDB(String name, Integer userSpecialNumber, String username, String email,
                           LocalDate dob, String school, LocalDate graduationDate,
                           Long phoneNumber, String password) {
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
    public Long getPhoneNumber() {
        return this.phoneNumber;
    }
    public void setPhoneNumber(Long phoneNumber) {
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
    public int getTokenVersion() {
        return this.tokenVersion;
    }
    public void setTokenVersion(int tokenVersion) {
        this.tokenVersion = tokenVersion;
    }
    public String getVehicleLicensePlate() {
        return this.vehicleLicensePlate;
    }
    public void setVehicleLicensePlate(String vehicleLicensePlate) {
        this.vehicleLicensePlate = vehicleLicensePlate;
    }
    public String getVehicleMake() {
        return this.vehicleMake;
    }
    public void setVehicleMake(String vehicleMake) {
        this.vehicleMake = vehicleMake;
    }
    public String getVehicleModel() {
        return this.vehicleModel;
    }
    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }
    public String getVehicleColor() {
        return this.vehicleColor;
    }
    public void setVehicleColor(String vehicleColor) {
        this.vehicleColor = vehicleColor;
    }
    public boolean isDriverVerified() {
        return this.driverVerified;
    }
    public void setDriverVerified(boolean driverVerified) {
        this.driverVerified = driverVerified;
    }
}
