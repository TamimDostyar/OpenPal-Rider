package openpal.database.systems;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.LocalDate;


@Entity
@Table(name = "profiles")
public class CreateProfileDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private Integer userSpecialNumber;
    private String email;
    private LocalDate dob;
    private String school;
    private LocalDate graduationDate;

    // required by JPA
    protected CreateProfileDB() {
    }

    public CreateProfileDB(String name, Integer userSpecialNumber, String email,
                           LocalDate dob, String school, LocalDate graduationDate) {
        this.name = name;
        this.userSpecialNumber = userSpecialNumber;
        this.email = email;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
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
}
