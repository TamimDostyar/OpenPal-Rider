package openpal.database.account_mgt;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Minimal tombstone for a deleted account. When a user deletes their account we
 * remove their full {@link CreateProfileDB} row, but keep just their name and
 * email here so we can count how many distinct users we've ever had. Retained
 * for at most one year (see the retention job), and never sold or used for
 * marketing.
 */
@Entity
@Table(name = "archived_users")
public class ArchivedUserDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String email;

    @Column(nullable = false, updatable = false)
    private LocalDateTime deletedAt;

    protected ArchivedUserDB() {
    }

    public ArchivedUserDB(String name, String email, LocalDateTime deletedAt) {
        this.name = name;
        this.email = email;
        this.deletedAt = deletedAt;
    }

    public UUID getId() {
        return this.id;
    }
    public String getName() {
        return this.name;
    }
    public String getEmail() {
        return this.email;
    }
    public LocalDateTime getDeletedAt() {
        return this.deletedAt;
    }
}
