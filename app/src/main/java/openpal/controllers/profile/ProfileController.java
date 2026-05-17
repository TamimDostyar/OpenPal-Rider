package openpal.controllers.profile;

import java.util.Date;
import java.util.Random;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


public class ProfileController {
    private String name;
    private Date dob;
    private String school;
    private Integer schoolYear;
    private Integer userGenerated_id;
    private String userInfoFile;
    private String cwd = System.getProperty("user.dir");
    private Path path = Paths.get(cwd).toAbsolutePath().resolve("../../../../../../../").normalize();

    ProfileController(String name, Date dob, String school, Integer schoolYear){
        this.name = name;
        this.dob = dob;
        this.school = school;
        this.schoolYear = schoolYear;
        this.userGenerated_id = numberGenerator();
        this.userInfoFile = null;
    }


    int numberGenerator(){
        Random random = new Random();
        int number = random.nextInt(9000) + 1000;
        return number;
    }

    // if the user file does not exist create one
    void makeJsonFile(String path_to_file){
        String file_name;
        String full_userPath = this.path + userInfoFile;

        if (full_userPath.endsWith(null) || full_userPath.endsWith("null")){
            file_name = this.path + this.name + "_" + dob + this.userGenerated_id + ".json";
        } 
        else {
            file_name = this.userInfoFile + this.name + "_" + dob + this.userGenerated_id + ".json";
        }

        Path user_file_path = Paths.get(file_name);

        try{

            if (!Files.exists(user_file_path)){
                Files.createFile(user_file_path);
                
            }

        } catch (IOException e){
            e.printStackTrace();
        }

    }
}
