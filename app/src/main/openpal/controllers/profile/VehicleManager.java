package openpal.controllers.profile;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;

@Component
public class VehicleManager {

    private final ProfileRepository profileRepo;
    private final AuthSupport auth;

    @Autowired
    public VehicleManager(ProfileRepository profileRepo, AuthSupport auth) {
        this.profileRepo = profileRepo;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> updateVehicle(String authHeader, VehicleInfo request) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        if (request == null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "vehicle info is required");
        }
        String plate = trimOrNull(request.getLicensePlate());
        String make = trimOrNull(request.getMake());
        String model = trimOrNull(request.getModel());
        String color = trimOrNull(request.getColor());
        if (plate == null || make == null || model == null || color == null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "licensePlate, make, model, and color are all required");
        }

        profile.setVehicleLicensePlate(plate);
        profile.setVehicleMake(make);
        profile.setVehicleModel(model);
        profile.setVehicleColor(color);
        profile.setDriverVerified(true);
        profileRepo.save(profile);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "vehicle info saved");
        body.put("driverVerified", true);
        return ResponseEntity.ok(body);
    }

    public ResponseEntity<Map<String, Object>> getVehicle(String authHeader) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("licensePlate", profile.getVehicleLicensePlate());
        body.put("make", profile.getVehicleMake());
        body.put("model", profile.getVehicleModel());
        body.put("color", profile.getVehicleColor());
        body.put("driverVerified", profile.isDriverVerified());
        return ResponseEntity.ok(body);
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
