package openpal.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    public void sendVerificationCode(String toEmail, String code) {
        send(toEmail, "Your OpenPal verification code",
            "Welcome to OpenPal!\n\n"
            + "Your 4-digit verification code is: " + code + "\n\n"
            + "It expires in 10 minutes. If you didn't sign up, you can ignore this email.");
    }

    public void sendBookingRequested(String driverEmail, String riderUsername,
                                     String origin, String destination, int seats) {
        send(driverEmail, "New ride request from @" + riderUsername,
            "@" + riderUsername + " requested " + seats + " seat(s) on your ride from "
            + origin + " to " + destination + ".\n\n"
            + "Open OpenPal to accept or decline.");
    }

    public void sendRideOffer(String riderEmail, String driverUsername,
                              String origin, String destination) {
        send(riderEmail, "@" + driverUsername + " offered you a ride",
            "@" + driverUsername + " offered to drive you from "
            + origin + " to " + destination + ".\n\n"
            + "Open OpenPal to accept or decline.");
    }

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

    public void sendNewDirectMessage(String recipientEmail, String senderUsername, String preview) {
        String clipped = preview == null ? "" : (preview.length() > 120
                ? preview.substring(0, 117) + "..."
                : preview);
        send(recipientEmail, "New message from @" + senderUsername,
            "@" + senderUsername + " sent you a message:\n\n" + clipped
            + "\n\nReply in OpenPal.");
    }

    public void sendRatingPrompt(String toEmail, String otherPartyUsername,
                                 String origin, String destination) {
        send(toEmail, "Rate your ride with @" + otherPartyUsername,
            "Your ride from " + origin + " to " + destination + " is complete.\n\n"
            + "Take a moment to rate @" + otherPartyUsername + " in OpenPal "
            + "so future riders and drivers know what to expect.");
    }

    private void send(String toEmail, String subject, String body) {
        if (fromAddress == null || fromAddress.isBlank()) {
            System.out.println("[EmailService] " + subject + " -> " + toEmail + "\n" + body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] failed to send to " + toEmail + ": " + e.getMessage());
        }
    }
}
