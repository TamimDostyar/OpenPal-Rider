package openpal.dto.ratings;

import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.ratingsDB.RatingDB;

public class RatingResponse {
    private UUID id;
    private UUID bookingId;
    private String raterUsername;
    private String ratedUsername;
    private Integer stars;
    private String text;
    private LocalDateTime createdAt;

    public RatingResponse() {
    }

    public static RatingResponse from(RatingDB r) {
        RatingResponse out = new RatingResponse();
        out.id = r.getId();
        out.bookingId = r.getBookingId();
        out.raterUsername = r.getRaterUsername();
        out.ratedUsername = r.getRatedUsername();
        out.stars = r.getStars();
        out.text = r.getText();
        out.createdAt = r.getCreatedAt();
        return out;
    }

    public UUID getId() { return this.id; }
    public UUID getBookingId() { return this.bookingId; }
    public String getRaterUsername() { return this.raterUsername; }
    public String getRatedUsername() { return this.ratedUsername; }
    public Integer getStars() { return this.stars; }
    public String getText() { return this.text; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
