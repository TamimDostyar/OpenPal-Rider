package openpal.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.homeFeed.FeedPosts;
import openpal.controllers.homeFeed.FeedPostsManager;

@RestController
@RequestMapping("api/feed")
public class HomePostsServices {

    private final FeedPostsManager manager;

    @Autowired
    public HomePostsServices(FeedPostsManager manager) {
        this.manager = manager;
    }

    @PostMapping("/create-post")
    public ResponseEntity<Map<String, Object>> createPost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody FeedPosts request) {
        return manager.createPost(authHeader, request);
    }

    @GetMapping("/posts")
    public ResponseEntity<?> listFeed(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listFeed(authHeader);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchFeed(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minSeats) {
        return manager.searchFeed(authHeader, destination, dateFrom, dateTo, maxPrice, minSeats);
    }

    @GetMapping("/posts/user/{username}")
    public ResponseEntity<?> listByUsername(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String username) {
        return manager.listByUsername(authHeader, username);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<?> listMyRides(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listMyRides(authHeader);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.deletePost(authHeader, id);
    }
}
