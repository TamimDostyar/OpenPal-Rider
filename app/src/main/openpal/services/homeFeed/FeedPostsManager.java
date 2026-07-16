package openpal.services.homeFeed;


import openpal.dto.homeFeed.FeedPostResponse;
import openpal.dto.homeFeed.FeedPosts;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

import openpal.services.security.AuthSupport;
import openpal.services.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.blocksDB.BlockRepository;
import openpal.database.homeFeedDB.FeedPostsDB;
import openpal.database.homeFeedDB.FeedPostsRepository;

@Component
public class FeedPostsManager {

    private final FeedPostsRepository feedRepo;
    private final ProfileRepository profileRepo;
    private final BlockRepository blockRepo;
    private final AuthSupport auth;

    @Autowired
    public FeedPostsManager(FeedPostsRepository feedRepo,
                            ProfileRepository profileRepo,
                            BlockRepository blockRepo,
                            AuthSupport auth) {
        this.feedRepo = feedRepo;
        this.profileRepo = profileRepo;
        this.blockRepo = blockRepo;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> createPost(String authHeader, FeedPosts request) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        String missing = firstMissingField(request);
        if (missing != null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, missing + " is required");
        }
        if (request.getPrice().signum() < 0) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "price must be non-negative");
        }
        if (request.getSeats() < 1) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "seats must be at least 1");
        }

        if (request.getPostType() == null || request.getPostType().isBlank()){
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "identify your post type");
        }

        FeedPostsDB post = new FeedPostsDB(
                profile.getUsername(),
                profile.getEmail(),
                request.getOrigin().trim(),
                request.getDestination().trim(),
                request.getPrice(),
                request.getSeats(),
                request.getDepartureTime(),
                request.getVehicleInfo(),
                request.getDescription(),
                request.getPostType()
        );
        post.setOriginLat(request.getOriginLat());
        post.setOriginLng(request.getOriginLng());
        post.setOriginPlaceId(request.getOriginPlaceId());
        post.setDestLat(request.getDestLat());
        post.setDestLng(request.getDestLng());
        post.setDestPlaceId(request.getDestPlaceId());
        post.setRecurringDays(normalizeRecurring(request.getRecurringDays()));
        post.setPostType(request.getPostType());

        FeedPostsDB saved = feedRepo.save(post);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "post created");
        body.put("post", FeedPostResponse.from(saved, profile));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> listFeed(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        String suffix = "@" + AuthSupport.emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo.findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(suffix);
        return ResponseEntity.ok(joinWithProfiles(removeBlocked(posts, hiddenEmails(caller))));
    }

    public ResponseEntity<?> searchFeed(String authHeader, String destination,
                                        LocalDateTime dateFrom, LocalDateTime dateTo,
                                        BigDecimal maxPrice, Integer minSeats) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        String suffix = "@" + AuthSupport.emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo.findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(suffix);

        Set<String> hidden = hiddenEmails(caller);
        String needle = destination == null ? null : destination.trim().toLowerCase();
        List<FeedPostsDB> filtered = posts.stream().filter(p -> {
            if (hidden.contains(p.getEmail().toLowerCase())) return false;
            if (needle != null && !needle.isEmpty()
                    && !p.getDestination().toLowerCase().contains(needle)) return false;
            if (dateFrom != null && p.getDepartureTime().isBefore(dateFrom)) return false;
            if (dateTo != null && p.getDepartureTime().isAfter(dateTo)) return false;
            if (maxPrice != null && p.getPrice().compareTo(maxPrice) > 0) return false;
            if (minSeats != null && p.getSeats() < minSeats) return false;
            return true;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(joinWithProfiles(filtered));
    }

    public ResponseEntity<?> listByUsername(String authHeader, String username) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        String suffix = "@" + AuthSupport.emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo
                .findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(username, suffix);
        return ResponseEntity.ok(joinWithProfiles(removeBlocked(posts, hiddenEmails(caller))));
    }

    public ResponseEntity<?> listMyRides(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        String suffix = "@" + AuthSupport.emailDomain(caller.getEmail());
        List<FeedPostsDB> posts = feedRepo
                .findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(
                        caller.getUsername(), suffix);
        return ResponseEntity.ok(joinWithProfiles(posts));
    }

    public ResponseEntity<Map<String, Object>> deletePost(String authHeader, UUID postId) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        Optional<FeedPostsDB> found = feedRepo.findById(postId);
        if (found.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "post not found");
        }
        FeedPostsDB post = found.get();
        if (!post.getEmail().equalsIgnoreCase(profile.getEmail())) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "you can only delete your own posts");
        }
        feedRepo.deleteById(postId);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "post deleted");
        return ResponseEntity.ok(body);
    }

    private Set<String> hiddenEmails(CreateProfileDB caller) {
        Set<String> hidden = new java.util.HashSet<>();
        for (String e : blockRepo.blockedEmailsBy(caller.getEmail())) hidden.add(e.toLowerCase());
        for (String e : blockRepo.emailsBlocking(caller.getEmail())) hidden.add(e.toLowerCase());
        return hidden;
    }

    private List<FeedPostsDB> removeBlocked(List<FeedPostsDB> posts, Set<String> hidden) {
        if (hidden.isEmpty()) return posts;
        return posts.stream()
                .filter(p -> !hidden.contains(p.getEmail().toLowerCase()))
                .collect(Collectors.toList());
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

    private static String normalizeRecurring(String raw) {
        if (raw == null || raw.isBlank()) return null;
        Set<String> valid = Set.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");
        List<String> kept = new ArrayList<>();
        for (String token : raw.split(",")) {
            String t = token.trim().toUpperCase();
            if (valid.contains(t) && !kept.contains(t)) {
                kept.add(t);
            }
        }
        return kept.isEmpty() ? null : String.join(",", kept);
    }
}
