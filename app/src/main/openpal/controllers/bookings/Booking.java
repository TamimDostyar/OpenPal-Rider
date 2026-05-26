package openpal.controllers.bookings;

import java.util.UUID;

public class Booking {
    private UUID postId;
    private Integer seatsRequested;

    public Booking() {
    }

    public UUID getPostId() { return this.postId; }
    public void setPostId(UUID postId) { this.postId = postId; }

    public Integer getSeatsRequested() { return this.seatsRequested; }
    public void setSeatsRequested(Integer seatsRequested) { this.seatsRequested = seatsRequested; }
}
