package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.profile.VehicleInfo;
import openpal.controllers.profile.VehicleManager;

@RestController
@RequestMapping("api/profile/vehicle")
public class VehicleService {

    private final VehicleManager manager;

    @Autowired
    public VehicleService(VehicleManager manager) {
        this.manager = manager;
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> update(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody VehicleInfo request) {
        return manager.updateVehicle(authHeader, request);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> get(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.getVehicle(authHeader);
    }
}
