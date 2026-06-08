package openpal.database.homeFeedDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_messages_sender_email", columnList = "senderEmail"),
        @Index(name = "idx_messages_recipient_email", columnList = "recipientEmail"),
        @Index(name = "idx_messages_created_at", columnList = "createdAt")
    }
)
public class MessagingSysDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String senderEmail;

    @Column(nullable = false)
    private String senderUsername;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String recipientUsername;

    private UUID bookingId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    private LocalDateTime readAt;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    protected MessagingSysDB() {
    }

    public MessagingSysDB(String senderEmail, String senderUsername,
                          String recipientEmail, String recipientUsername,
                          UUID bookingId, String text) {
        this.senderEmail = senderEmail;
        this.senderUsername = senderUsername;
        this.recipientEmail = recipientEmail;
        this.recipientUsername = recipientUsername;
        this.bookingId = bookingId;
        this.text = text;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return this.id; }
    public String getSenderEmail() { return this.senderEmail; }
    public String getSenderUsername() { return this.senderUsername; }
    public String getRecipientEmail() { return this.recipientEmail; }
    public String getRecipientUsername() { return this.recipientUsername; }
    public UUID getBookingId() { return this.bookingId; }
    public String getText() { return this.text; }
    public LocalDateTime getReadAt() { return this.readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
