package openpal.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${openpal.mail.from:}")
    private String fromAddress;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends the signup verification code. Unlike the notification emails below
     * this is synchronous and propagates failures: if we can't deliver the code
     * the caller must know, so signup can fail loudly instead of telling the
     * user "check your email" when nothing was sent.
     */
    public void sendVerificationCode(String toEmail, String code) {
        sendOrThrow(toEmail, "Your OpenPal verification code",
            "Welcome to OpenPal!\n\n"
            + "Your 4-digit verification code is: " + code + "\n\n"
            + "It expires in 10 minutes. If you didn't sign up, you can ignore this email.");
    }

    @Async
    public void sendBookingRequested(String driverEmail, String riderUsername,
                                     String origin, String destination, int seats) {
        send(driverEmail, "New ride request from @" + riderUsername,
            "@" + riderUsername + " requested " + seats + " seat(s) on your ride from "
            + origin + " to " + destination + ".\n\n"
            + "Open OpenPal to accept or decline.");
    }

    @Async
    public void sendRideOffer(String riderEmail, String driverUsername,
                              String origin, String destination) {
        send(riderEmail, "@" + driverUsername + " offered you a ride",
            "@" + driverUsername + " offered to drive you from "
            + origin + " to " + destination + ".\n\n"
            + "Open OpenPal to accept or decline.");
    }

    @Async
    public void sendBookingResponse(String riderEmail, boolean accepted,
                                    String driverUsername, String origin, String destination) {
        String verb = accepted ? "accepted" : "declined";
        send(riderEmail, "Your ride request was " + verb,
            "@" + driverUsername + " " + verb + " your request for the ride from "
            + origin + " to " + destination + ".\n\n"
            + (accepted
                ? "You can message the driver in OpenPal to coordinate pickup."
                : "Browse the feed for other rides going your way."));
    }

    @Async
    public void sendNewDirectMessage(String recipientEmail, String senderUsername, String preview) {
        String clipped = preview == null ? "" : (preview.length() > 120
                ? preview.substring(0, 117) + "..."
                : preview);
        send(recipientEmail, "New message from @" + senderUsername,
            "@" + senderUsername + " sent you a message:\n\n" + clipped
            + "\n\nReply in OpenPal.");
    }

    @Async
    public void sendRatingPrompt(String toEmail, String otherPartyUsername,
                                 String origin, String destination) {
        send(toEmail, "Rate your ride with @" + otherPartyUsername,
            "Your ride from " + origin + " to " + destination + " is complete.\n\n"
            + "Take a moment to rate @" + otherPartyUsername + " in OpenPal "
            + "so future riders and drivers know what to expect.");
    }

    /** Best-effort send for non-critical notifications: never throws. */
    private void send(String toEmail, String subject, String body) {
        try {
            sendOrThrow(toEmail, subject, body);
        } catch (Exception e) {
            System.err.println("[EmailService] failed to send to " + toEmail + ": " + e.getMessage());
        }
    }

    /**
     * Actually delivers the email. Throws if SMTP delivery fails so critical
     * paths (the signup code) can react. When no from-address is configured we
     * fall back to logging the message — handy for local dev without SMTP, but
     * note the email is NOT delivered in that mode.
     */
    private void sendOrThrow(String toEmail, String subject, String body) {
        if (fromAddress == null || fromAddress.isBlank()) {
            System.out.println("[EmailService] MAIL not configured (set MAIL_USERNAME/MAIL_PASSWORD). "
                + "Logging instead of sending:\n" + subject + " -> " + toEmail + "\n" + body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
