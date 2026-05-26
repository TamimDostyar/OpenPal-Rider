package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.ratings.Rating;
import openpal.controllers.ratings.RatingManager;

@RestController
@RequestMapping("api/ratings")
public class RatingService {

    private final RatingManager manager;

    @Autowired
    public RatingService(RatingManager manager) {
        this.manager = manager;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Rating request) {
        return manager.create(authHeader, request);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> listForUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String username) {
        return manager.listForUser(authHeader, username);
    }
}
