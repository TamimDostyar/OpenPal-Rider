package openpal.dto.homeFeed;

import java.util.UUID;

public class MessagingSys {
    private String recipientUsername;
    private UUID bookingId;
    private String text;

    public MessagingSys() {
    }

    public String getRecipientUsername() { return this.recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }

    public UUID getBookingId() { return this.bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }

    public String getText() { return this.text; }
    public void setText(String text) { this.text = text; }
}
