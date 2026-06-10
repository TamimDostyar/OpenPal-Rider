package openpal.database.ratingsDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "ratings",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_rating_per_booking_per_rater",
                          columnNames = {"bookingId", "raterEmail"})
    },
    indexes = {
        @Index(name = "idx_ratings_rated_email", columnList = "ratedEmail"),
        @Index(name = "idx_ratings_booking_id", columnList = "bookingId")
    }
)
public class RatingDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private String raterEmail;

    @Column(nullable = false)
    private String raterUsername;

    @Column(nullable = false)
    private String ratedEmail;

    @Column(nullable = false)
    private String ratedUsername;

    @Column(nullable = false)
    private Integer stars;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    protected RatingDB() {
    }

    public RatingDB(UUID bookingId, String raterEmail, String raterUsername,
                    String ratedEmail, String ratedUsername, Integer stars, String text) {
        this.bookingId = bookingId;
        this.raterEmail = raterEmail;
        this.raterUsername = raterUsername;
        this.ratedEmail = ratedEmail;
        this.ratedUsername = ratedUsername;
        this.stars = stars;
        this.text = text;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return this.id; }
    public UUID getBookingId() { return this.bookingId; }
    public String getRaterEmail() { return this.raterEmail; }
    public String getRaterUsername() { return this.raterUsername; }
    public String getRatedEmail() { return this.ratedEmail; }
    public String getRatedUsername() { return this.ratedUsername; }
    public Integer getStars() { return this.stars; }
    public String getText() { return this.text; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
