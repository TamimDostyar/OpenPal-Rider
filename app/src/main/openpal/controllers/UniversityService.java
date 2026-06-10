package openpal.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import openpal.util.Utils;

@RestController
@RequestMapping("api/universities")
public class UniversityService {

    @GetMapping
    public ResponseEntity<Map<String, Object>> listUniversities() {
        List<Map<String, String>> universities = Utils.getUniversities();
        return ResponseEntity.ok(Map.of(
            "count", universities.size(),
            "universities", universities
        ));
    }
}
