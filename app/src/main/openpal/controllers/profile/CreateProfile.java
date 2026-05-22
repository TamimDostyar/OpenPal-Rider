package openpal.controllers.profile;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;


/**
 * POST /api/user/create-profile request body.
 */
public class CreateProfile {
    private String name;
    private String email;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String school;
    // Long, not Integer: a 10-digit phone number overflows a 32-bit int.
    private Long phoneNumber;
    private String password;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate graduationDate;

    // required for JSON deserialization
    public CreateProfile() {
    }

    public CreateProfile(String name, String email, LocalDate dob,
                         String school, LocalDate graduationDate,
                        Long phoneNumber) {
        this.name = name;
        this.email = email;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
        this.phoneNumber = phoneNumber;
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

    public Long getPhoneNumber(){
        return this.phoneNumber;
    }
    public void setPhoneNumber(Long phoneNumber){
        this.phoneNumber = phoneNumber;
    }

    public String getPassword(){
        return this.password;
    }
    public void setPassword(String password){
        this.password = password;
    }
}
