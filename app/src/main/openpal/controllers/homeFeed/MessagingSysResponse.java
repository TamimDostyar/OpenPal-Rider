package openpal.controllers.homeFeed;

import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.homeFeedDB.MessagingSysDB;

public class MessagingSysResponse {
    private UUID id;
    private String senderUsername;
    private String senderName;
    private String senderEmail;
    private String recipientUsername;
    private String recipientName;
    private String recipientEmail;
    private UUID bookingId;
    private String text;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public MessagingSysResponse() {
    }

    public static MessagingSysResponse from(MessagingSysDB msg) {
        return from(msg, null, null);
    }

    public static MessagingSysResponse from(MessagingSysDB msg, String senderName, String recipientName) {
        MessagingSysResponse r = new MessagingSysResponse();
        r.id = msg.getId();
        r.senderUsername = msg.getSenderUsername();
        r.senderName = senderName;
        r.senderEmail = msg.getSenderEmail();
        r.recipientUsername = msg.getRecipientUsername();
        r.recipientName = recipientName;
        r.recipientEmail = msg.getRecipientEmail();
        r.bookingId = msg.getBookingId();
        r.text = msg.getText();
        r.readAt = msg.getReadAt();
        r.createdAt = msg.getCreatedAt();
        return r;
    }

    public UUID getId() { return this.id; }
    public String getSenderUsername() { return this.senderUsername; }
    public String getSenderName() { return this.senderName; }
    public String getSenderEmail() { return this.senderEmail; }
    public String getRecipientUsername() { return this.recipientUsername; }
    public String getRecipientName() { return this.recipientName; }
    public String getRecipientEmail() { return this.recipientEmail; }
    public UUID getBookingId() { return this.bookingId; }
    public String getText() { return this.text; }
    public LocalDateTime getReadAt() { return this.readAt; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
