package openpal.database.blocksDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A "block" recorded when one user blocks another. The blocker no longer sees
 * the blocked user's posts in their feed, and neither party can message the
 * other. Stored one row per (blocker, blocked) pair.
 */
@Entity
@Table(
    name = "user_blocks",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_block_pair", columnNames = {"blockerEmail", "blockedEmail"})
    },
    indexes = {
        @Index(name = "idx_blocks_blocker", columnList = "blockerEmail"),
        @Index(name = "idx_blocks_blocked", columnList = "blockedEmail")
    }
)
public class BlockDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String blockerEmail;

    @Column(nullable = false)
    private String blockerUsername;

    @Column(nullable = false)
    private String blockedEmail;

    @Column(nullable = false)
    private String blockedUsername;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    protected BlockDB() {
    }

    public BlockDB(String blockerEmail, String blockerUsername,
                   String blockedEmail, String blockedUsername, String reason) {
        this.blockerEmail = blockerEmail;
        this.blockerUsername = blockerUsername;
        this.blockedEmail = blockedEmail;
        this.blockedUsername = blockedUsername;
        this.reason = reason;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return this.id; }
    public String getBlockerEmail() { return this.blockerEmail; }
    public String getBlockerUsername() { return this.blockerUsername; }
    public String getBlockedEmail() { return this.blockedEmail; }
    public String getBlockedUsername() { return this.blockedUsername; }
    public String getReason() { return this.reason; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
