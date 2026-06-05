package openpal.controllers.profile;

import java.util.Random;
import java.nio.file.Path;
import java.nio.file.Paths;


/**
 * Helpers for profile creation: generates the random "special number" and the
 * server-assigned username derived from the user's name and number.
 */
public class ProfileController {

    private String name;
    private Integer specialID;

    private String cwd = System.getProperty("user.dir");
    private Path path = Paths.get(cwd).toAbsolutePath().resolve("../../../../../../../").normalize();

    public ProfileController(String name){
        this.name = name;
        this.specialID = numberGenerator();
    }


    public static int numberGenerator(){
        Random random = new Random();
        int number = random.nextInt(9000) + 1000;
        return number;
    }

    public static String generateUsername(String name, Integer specialNumber) {
        String letters = name == null ? "" : name.trim().toLowerCase().replaceAll("[^a-z]", "");
        String prefix = letters.length() >= 3 ? letters.substring(0, 3) : letters;
        return prefix + specialNumber;
    }

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
