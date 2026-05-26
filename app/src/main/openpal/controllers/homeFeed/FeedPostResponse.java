package openpal.controllers.homeFeed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.homeFeedDB.FeedPostsDB;

public class FeedPostResponse {
    private UUID id;

    private String username;
    private String email;
    private String name;
    private String school;
    private Boolean driverVerified;

    private String origin;
    private Double originLat;
    private Double originLng;
    private String originPlaceId;

    private String destination;
    private Double destLat;
    private Double destLng;
    private String destPlaceId;

    private BigDecimal price;
    private Integer seats;
    private LocalDateTime departureTime;
    private String vehicleInfo;
    private String description;
    private String recurringDays;

    private LocalDateTime createdAt;

    public FeedPostResponse() {
    }

    public static FeedPostResponse from(FeedPostsDB post, CreateProfileDB profile) {
        FeedPostResponse r = new FeedPostResponse();
        r.id = post.getId();
        r.username = post.getUsername();
        r.email = post.getEmail();
        r.origin = post.getOrigin();
        r.originLat = post.getOriginLat();
        r.originLng = post.getOriginLng();
        r.originPlaceId = post.getOriginPlaceId();
        r.destination = post.getDestination();
        r.destLat = post.getDestLat();
        r.destLng = post.getDestLng();
        r.destPlaceId = post.getDestPlaceId();
        r.price = post.getPrice();
        r.seats = post.getSeats();
        r.departureTime = post.getDepartureTime();
        r.vehicleInfo = post.getVehicleInfo();
        r.description = post.getDescription();
        r.recurringDays = post.getRecurringDays();
        r.createdAt = post.getCreatedAt();
        if (profile != null) {
            r.name = profile.getName();
            r.school = profile.getSchool();
            r.driverVerified = profile.isDriverVerified();
        }
        return r;
    }

    public UUID getId() { return this.id; }
    public String getUsername() { return this.username; }
    public String getEmail() { return this.email; }
    public String getName() { return this.name; }
    public String getSchool() { return this.school; }
    public Boolean getDriverVerified() { return this.driverVerified; }
    public String getOrigin() { return this.origin; }
    public Double getOriginLat() { return this.originLat; }
    public Double getOriginLng() { return this.originLng; }
    public String getOriginPlaceId() { return this.originPlaceId; }
    public String getDestination() { return this.destination; }
    public Double getDestLat() { return this.destLat; }
    public Double getDestLng() { return this.destLng; }
    public String getDestPlaceId() { return this.destPlaceId; }
    public BigDecimal getPrice() { return this.price; }
    public Integer getSeats() { return this.seats; }
    public LocalDateTime getDepartureTime() { return this.departureTime; }
    public String getVehicleInfo() { return this.vehicleInfo; }
    public String getDescription() { return this.description; }
    public String getRecurringDays() { return this.recurringDays; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
