package openpal.controllers.profile;

import java.util.Date;
import java.util.Random;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


public class ProfileController {

    private String name;
    private Integer specialID;

    private String cwd = System.getProperty("user.dir");
    private Path path = Paths.get(cwd).toAbsolutePath().resolve("../../../../../../../").normalize();

    public ProfileController(String name){
        this.name = name;
        this.specialID = numberGenerator();
    }


    // numbers to get genereted by us
    public static int numberGenerator(){
        Random random = new Random();
        int number = random.nextInt(9000) + 1000;
        return number;
    }
    // just check if the numbers are assigned by us
    Boolean isValidPerson(){
        String choesnPerson = this.name;
        Integer personNumber = this.specialID;
        
        if (choesnPerson.toLowerCase() == "tamim"){

            if (personNumber < 1000 || personNumber > 9999){
                return false;
            }
            return true;
        }
    
        return false;
    }


    
}
