package openpal.database.homeFeedDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA entity for a feed/ride post in the "feeds" table. Stores poster
 * identity, ride details, and audit timestamps maintained on insert/update.
 */
@Entity
@Table(
    name = "feeds",
    indexes = {
        @Index(name = "idx_feeds_username", columnList = "username"),
        @Index(name = "idx_feeds_email", columnList = "email"),
        @Index(name = "idx_feeds_created_at", columnList = "createdAt")
    }
)
public class FeedPostsDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    private String vehicleInfo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    protected FeedPostsDB() {
    }

    public FeedPostsDB(String username, String email, String origin, String destination,
                       BigDecimal price, Integer seats, LocalDateTime departureTime,
                       String vehicleInfo, String description) {
        this.username = username;
        this.email = email;
        this.origin = origin;
        this.destination = destination;
        this.price = price;
        this.seats = seats;
        this.departureTime = departureTime;
        this.vehicleInfo = vehicleInfo;
        this.description = description;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return this.id; }

    public String getUsername() { return this.username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }

    public String getOrigin() { return this.origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return this.destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public BigDecimal getPrice() { return this.price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getSeats() { return this.seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public LocalDateTime getDepartureTime() { return this.departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public String getVehicleInfo() { return this.vehicleInfo; }
    public void setVehicleInfo(String vehicleInfo) { this.vehicleInfo = vehicleInfo; }

    public String getDescription() { return this.description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
}
