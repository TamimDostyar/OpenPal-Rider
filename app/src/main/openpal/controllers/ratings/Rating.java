package openpal.controllers.ratings;

import java.util.UUID;

public class Rating {
    private UUID bookingId;
    private Integer stars;
    private String text;

    public Rating() {
    }

    public UUID getBookingId() { return this.bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }

    public Integer getStars() { return this.stars; }
    public void setStars(Integer stars) { this.stars = stars; }

    public String getText() { return this.text; }
    public void setText(String text) { this.text = text; }
}
