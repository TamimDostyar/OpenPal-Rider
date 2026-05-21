package openpal.controllers.profile;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;


/**
 * Request payload for creating a profile. Deserialized from the
 * POST /api/user/create-profile request body.
 */
public class CreateProfile {
    private String name;
    private String email;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String school;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate graduationDate;

    // required for JSON deserialization
    public CreateProfile() {
    }

    public CreateProfile(String name, String email, LocalDate dob,
                         String school, LocalDate graduationDate) {
        this.name = name;
        this.email = email;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
    }

    public String getName() {
        return this.name;
    }
    public void setName(String name) {
        this.name = name;
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
