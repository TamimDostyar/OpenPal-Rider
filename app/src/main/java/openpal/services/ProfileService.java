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
import openpal.database.systems.CreateProfileDB;
import openpal.database.systems.ProfileRepository;


@RestController
@RequestMapping("api/user")
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @PostMapping("/create-profile")
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
        if (!Utils.isSchoolValid(request.getSchool())) {
            response.put("error", "school is not a recognized US university");
            return ResponseEntity.badRequest().body(response);
        }

        // server-assigned identifier for the new profile
        Integer specialNumber = ProfileController.numberGenerator();

        CreateProfileDB profile = new CreateProfileDB(
            request.getName().trim(),
            specialNumber,
            request.getEmail().trim(),
            request.getDob(),
            request.getSchool().trim(),
            request.getGraduationDate()
        );
        CreateProfileDB saved = profileRepository.save(profile);

        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("userSpecialNumber", saved.getUserSpecialNumber());
        response.put("email", saved.getEmail());
        response.put("dob", saved.getDob());
        response.put("school", saved.getSchool());
        response.put("graduationDate", saved.getGraduationDate());
        return ResponseEntity.status(201).body(response);
    }
}
