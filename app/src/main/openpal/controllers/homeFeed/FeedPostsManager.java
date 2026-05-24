package openpal.controllers.homeFeed;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import openpal.controllers.security.JsonTokenWeb;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.homeFeedDB.FeedPostsDB;
import openpal.database.homeFeedDB.FeedPostsRepository;

/**
 * Business logic for the school-scoped home feed: authenticates callers via
 * JWT and handles create, list, and delete operations against verified-email accounts.
 */
@Component
public class FeedPostsManager {

    private final FeedPostsRepository feedRepo;
    private final ProfileRepository profileRepo;
    private final JsonTokenWeb jsonTokenWeb;

    @Autowired
    public FeedPostsManager(FeedPostsRepository feedRepo,
                            ProfileRepository profileRepo,
                            JsonTokenWeb jsonTokenWeb) {
        this.feedRepo = feedRepo;
        this.profileRepo = profileRepo;
        this.jsonTokenWeb = jsonTokenWeb;
    }

    public static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }

    public CreateProfileDB authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "missing or malformed Authorization header");
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        Claims claims;
        try {
            claims = jsonTokenWeb.parseClaims(token);
        } catch (JwtException e) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "invalid token");
        }
        String email = claims.getSubject();
        if (email == null || email.isBlank()) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "token missing subject");
        }
        CreateProfileDB profile = profileRepo.findByEmail(email)
                .orElseThrow(() -> new AuthFailure(HttpStatus.UNAUTHORIZED, "account not found"));

        Integer tokenVer = claims.get("ver", Integer.class);
        if (tokenVer == null || tokenVer != profile.getTokenVersion()) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "token has been revoked");
        }

        if (!profile.isEmailVerified()) {
            throw new AuthFailure(HttpStatus.FORBIDDEN, "email not verified");
        }
        return profile;
    }

    public ResponseEntity<Map<String, Object>> createPost(String authHeader, FeedPosts request) {
        CreateProfileDB profile;
        try {
            profile = authenticate(authHeader);
        } catch (AuthFailure f) {
            return error(f.status, f.getMessage());
        }

        String missing = firstMissingField(request);
        if (missing != null) {
            return error(HttpStatus.BAD_REQUEST, missing + " is required");
        }
        if (request.getPrice().signum() < 0) {
            return error(HttpStatus.BAD_REQUEST, "price must be non-negative");
        }
        if (request.getSeats() < 1) {
            return error(HttpStatus.BAD_REQUEST, "seats must be at least 1");
        }

        FeedPostsDB saved = feedRepo.save(new FeedPostsDB(
                profile.getUsername(),
                profile.getEmail(),
                request.getOrigin().trim(),
                request.getDestination().trim(),
                request.getPrice(),
                request.getSeats(),
                request.getDepartureTime(),
                request.getVehicleInfo(),
                request.getDescription()
        ));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "post created");
        body.put("post", FeedPostResponse.from(saved, profile));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> listFeed(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = authenticate(authHeader);
        } catch (AuthFailure f) {
            return error(f.status, f.getMessage());
        }
        String suffix = "@" + emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo.findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(suffix);
        return ResponseEntity.ok(joinWithProfiles(posts));
    }

    public ResponseEntity<?> listByUsername(String authHeader, String username) {
        CreateProfileDB caller;
        try {
            caller = authenticate(authHeader);
        } catch (AuthFailure f) {
            return error(f.status, f.getMessage());
        }
        String suffix = "@" + emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo
                .findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(username, suffix);
        return ResponseEntity.ok(joinWithProfiles(posts));
    }

    public ResponseEntity<Map<String, Object>> deletePost(String authHeader, UUID postId) {
        CreateProfileDB profile;
        try {
            profile = authenticate(authHeader);
        } catch (AuthFailure f) {
            return error(f.status, f.getMessage());
        }

        Optional<FeedPostsDB> found = feedRepo.findById(postId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "post not found");
        }
        FeedPostsDB post = found.get();
        if (!post.getEmail().equalsIgnoreCase(profile.getEmail())) {
            return error(HttpStatus.FORBIDDEN, "you can only delete your own posts");
        }
        feedRepo.deleteById(postId);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "post deleted");
        return ResponseEntity.ok(body);
    }

    static String emailDomain(String email) {
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) {
            throw new AuthFailure(HttpStatus.UNAUTHORIZED, "account email is malformed");
        }
        return email.substring(at + 1).toLowerCase();
    }

    private List<FeedPostResponse> joinWithProfiles(List<FeedPostsDB> posts) {
        if (posts.isEmpty()) {
            return new ArrayList<>();
        }
        Set<String> emails = posts.stream()
                .map(FeedPostsDB::getEmail)
                .collect(Collectors.toSet());
        Map<String, CreateProfileDB> byEmail = new HashMap<>();
        for (String email : emails) {
            profileRepo.findByEmail(email).ifPresent(p -> byEmail.put(p.getEmail(), p));
        }
        List<FeedPostResponse> out = new ArrayList<>(posts.size());
        for (FeedPostsDB post : posts) {
            out.add(FeedPostResponse.from(post, byEmail.get(post.getEmail())));
        }
        return out;
    }

    private static String firstMissingField(FeedPosts r) {
        if (r.getOrigin() == null || r.getOrigin().isBlank()) return "origin";
        if (r.getDestination() == null || r.getDestination().isBlank()) return "destination";
        if (r.getPrice() == null) return "price";
        if (r.getSeats() == null) return "seats";
        if (r.getDepartureTime() == null) return "departureTime";
        return null;
    }

    public static class AuthFailure extends RuntimeException {
        final HttpStatus status;
        AuthFailure(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }
    }
}
