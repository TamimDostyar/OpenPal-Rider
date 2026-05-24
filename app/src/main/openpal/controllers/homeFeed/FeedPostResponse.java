package openpal.controllers.homeFeed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.homeFeedDB.FeedPostsDB;

/**
 * Feed payload returned to the client, combining a feed row with the matching
 * profile fields. Lets the frontend render a complete card from a single response.
 */
public class FeedPostResponse {
    private UUID id;

    private String username;
    private String email;
    private String name;
    private String school;

    private String origin;
    private String destination;
    private BigDecimal price;
    private Integer seats;
    private LocalDateTime departureTime;
    private String vehicleInfo;
    private String description;

    private LocalDateTime createdAt;

    public FeedPostResponse() {
    }

    public static FeedPostResponse from(FeedPostsDB post, CreateProfileDB profile) {
        FeedPostResponse r = new FeedPostResponse();
        r.id = post.getId();
        r.username = post.getUsername();
        r.email = post.getEmail();
        r.origin = post.getOrigin();
        r.destination = post.getDestination();
        r.price = post.getPrice();
        r.seats = post.getSeats();
        r.departureTime = post.getDepartureTime();
        r.vehicleInfo = post.getVehicleInfo();
        r.description = post.getDescription();
        r.createdAt = post.getCreatedAt();
        if (profile != null) {
            r.name = profile.getName();
            r.school = profile.getSchool();
        }
        return r;
    }

    public UUID getId() { return this.id; }
    public String getUsername() { return this.username; }
    public String getEmail() { return this.email; }
    public String getName() { return this.name; }
    public String getSchool() { return this.school; }
    public String getOrigin() { return this.origin; }
    public String getDestination() { return this.destination; }
    public BigDecimal getPrice() { return this.price; }
    public Integer getSeats() { return this.seats; }
    public LocalDateTime getDepartureTime() { return this.departureTime; }
    public String getVehicleInfo() { return this.vehicleInfo; }
    public String getDescription() { return this.description; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
