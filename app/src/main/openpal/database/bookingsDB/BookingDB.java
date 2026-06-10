package openpal.database.bookingsDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_bookings_post_id", columnList = "postId"),
        @Index(name = "idx_bookings_rider_email", columnList = "riderEmail"),
        @Index(name = "idx_bookings_driver_email", columnList = "driverEmail"),
        @Index(name = "idx_bookings_status", columnList = "status")
    }
)
public class BookingDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID postId;

    @Column(nullable = false)
    private String riderEmail;

    @Column(nullable = false)
    private String riderUsername;

    @Column(nullable = false)
    private String driverEmail;

    @Column(nullable = false)
    private String driverUsername;

    @Column(nullable = false)
    private Integer seatsRequested;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    protected BookingDB() {
    }

    public BookingDB(UUID postId, String riderEmail, String riderUsername,
                     String driverEmail, String driverUsername, Integer seatsRequested) {
        this.postId = postId;
        this.riderEmail = riderEmail;
        this.riderUsername = riderUsername;
        this.driverEmail = driverEmail;
        this.driverUsername = driverUsername;
        this.seatsRequested = seatsRequested;
        this.status = BookingStatus.REQUESTED;
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
    public UUID getPostId() { return this.postId; }
    public String getRiderEmail() { return this.riderEmail; }
    public String getRiderUsername() { return this.riderUsername; }
    public String getDriverEmail() { return this.driverEmail; }
    public String getDriverUsername() { return this.driverUsername; }
    public Integer getSeatsRequested() { return this.seatsRequested; }
    public BookingStatus getStatus() { return this.status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
}
