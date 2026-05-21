package openpal.services;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

// import logic
import openpal.controllers.profile.CreateProfile;
import openpal.controllers.profile.ProfileController;
import openpal.controllers.profile.Utils;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.account_mgt.PasswordHasher;


@RestController
@RequestMapping("api/user")
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @PostMapping("/create-user")
    public ResponseEntity<Map<String, Object>> createProfile(@RequestBody CreateProfile request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getName() == null || request.getName().isBlank()) {
            response.put("error", "name is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            response.put("error", "email is required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getPhoneNumber() == null){
            response.put("error", "phone number required");
            return ResponseEntity.badRequest().body(response);
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            response.put("error", "password is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (!Utils.isSchoolValid(request.getSchool())) {
            response.put("error", "school is not a recognized US university");
            return ResponseEntity.badRequest().body(response);
        }

        // reject duplicate signups so emails stay unique
        if (profileRepository.existsByEmail(request.getEmail().trim())) {
            response.put("error", "an account with this email already exists");
            return ResponseEntity.status(409).body(response);
        }

        // server-assigned identifier for the new profile
        Integer specialNumber = ProfileController.numberGenerator();

        CreateProfileDB profile = new CreateProfileDB(
            request.getName().trim(),
            specialNumber,
            request.getEmail().trim(),
            request.getDob(),
            request.getSchool().trim(),
            request.getGraduationDate(),
            request.getPhoneNumber(),
            PasswordHasher.hash(request.getPassword())
        );
        CreateProfileDB saved = profileRepository.save(profile);

        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("userSpecialNumber", saved.getUserSpecialNumber());
        response.put("email", saved.getEmail());
        response.put("dob", saved.getDob());
        response.put("school", saved.getSchool());
        response.put("graduationDate", saved.getGraduationDate());
        response.put("PhoneNumber", saved.getPhoneNumber());
        return ResponseEntity.status(201).body(response);
    }
}
