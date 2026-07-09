package openpal.controllers;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.deviceDB.DeviceTokenDB;
import openpal.database.deviceDB.DeviceTokenRepository;
import openpal.dto.device.DeviceTokenRequest;
import openpal.services.security.AuthSupport;
import openpal.services.security.AuthSupport.AuthFailure;

@RestController
@RequestMapping("api/devices")
public class DeviceTokenController {

    private final DeviceTokenRepository deviceTokenRepo;
    private final AuthSupport auth;

    @Autowired
    public DeviceTokenController(DeviceTokenRepository deviceTokenRepo, AuthSupport auth) {
        this.deviceTokenRepo = deviceTokenRepo;
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody DeviceTokenRequest request) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        Optional<DeviceTokenDB> existing = deviceTokenRepo.findByToken(request.getToken());
        if (existing.isPresent()) {
            DeviceTokenDB dt = existing.get();
            dt.setUserEmail(caller.getEmail());
            dt.setUpdatedAt(java.time.LocalDateTime.now());
            deviceTokenRepo.save(dt);
        } else {
            deviceTokenRepo.save(new DeviceTokenDB(caller.getEmail(), request.getToken(), request.getPlatform()));
        }

        return ResponseEntity.ok(Map.of("message", "device registered"));
    }
}