package openpal.controllers.profile;
import java.util.Date;


public class CreateProfile {
    private String name;
    private Date dob;
    private String school;
    private Date graduationDate;

    CreateProfile(String name, Date dob, String school, Date graduationDate){
        this.name = name;
        this.dob = dob;
        this.school = school;
        this.graduationDate = graduationDate;
    }
}
