package openpal.controllers.profile;

import java.util.Date;
import java.util.Random;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;


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
    /**
     * Builds a server-assigned username: first 3 letters of the user's name,
     * the two-digit month they were born, and their special number.
     * e.g. name "Tamim", born in May, number 1234  ->  "tam051234"
     */
    public static String generateUsername(String name, LocalDate dob, Integer specialNumber) {
        String letters = name == null ? "" : name.trim().toLowerCase().replaceAll("[^a-z]", "");
        String prefix = letters.length() >= 3 ? letters.substring(0, 3) : letters;
        String month = dob == null ? "00" : String.format("%02d", dob.getMonthValue());
        return prefix + month + specialNumber;
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
