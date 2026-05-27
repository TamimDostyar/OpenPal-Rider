package openpal.controllers.bookings;

import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.bookingsDB.BookingDB;
import openpal.database.bookingsDB.BookingStatus;

public class BookingResponse {
    private UUID id;
    private UUID postId;
    private String riderUsername;
    private String riderEmail;
    private String driverUsername;
    private String driverEmail;
    private Integer seatsRequested;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private String postType;

    public BookingResponse() {
    }

    public static BookingResponse from(BookingDB b) {
        BookingResponse r = new BookingResponse();
        r.id = b.getId();
        r.postId = b.getPostId();
        r.riderUsername = b.getRiderUsername();
        r.riderEmail = b.getRiderEmail();
        r.driverUsername = b.getDriverUsername();
        r.driverEmail = b.getDriverEmail();
        r.seatsRequested = b.getSeatsRequested();
        r.status = b.getStatus();
        r.createdAt = b.getCreatedAt();
        r.updatedAt = b.getUpdatedAt();
        return r;
    }

    public void setRideSummary(String origin, String destination, LocalDateTime departureTime) {
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
    }

    public void setPostType(String postType) {
        this.postType = postType;
    }

    public UUID getId() { return this.id; }
    public UUID getPostId() { return this.postId; }
    public String getRiderUsername() { return this.riderUsername; }
    public String getRiderEmail() { return this.riderEmail; }
    public String getDriverUsername() { return this.driverUsername; }
    public String getDriverEmail() { return this.driverEmail; }
    public Integer getSeatsRequested() { return this.seatsRequested; }
    public BookingStatus getStatus() { return this.status; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public String getOrigin() { return this.origin; }
    public String getDestination() { return this.destination; }
    public LocalDateTime getDepartureTime() { return this.departureTime; }
    public String getPostType() { return this.postType; }
}
