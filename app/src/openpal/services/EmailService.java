package openpal.services;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Sends transactional email through Brevo's HTTPS API (port 443).
 *
 * <p>We deliberately do NOT use SMTP: our host (Render) firewalls outbound SMTP
 * ports, so JavaMailSender → Gmail just times out. Brevo's REST endpoint goes
 * over plain HTTPS, which is not blocked.
 *
 * <p>Set {@code BREVO_API_KEY} and {@code MAIL_USERNAME} (the from-address,
 * which must be a verified sender in Brevo). With no key configured we log the
 * message instead of sending — convenient for local dev.
 */
@Service
public class EmailService {

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper json = new ObjectMapper();

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${openpal.mail.from:}")
    private String fromAddress;

    @Value("${openpal.mail.fromName:OpenPal}")
    private String fromName;

    /**
     * Where moderation alerts (user blocks / objectionable content) are sent.
     * Falls back to the from-address so we always have somewhere to notify.
     */
    @Value("${openpal.moderation.email:${MODERATION_EMAIL:}}")
    private String moderationEmail;

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

    /**
     * Sends a password-reset token. Best-effort: never throws. The reset flow
     * returns the same neutral message whether or not the address exists, so a
     * delivery failure must not surface to the caller (a thrown error would leak
     * account existence and expose internals). The token is already persisted,
     * so the user can simply request another reset if delivery fails.
     */
    public void sendPasswordResetToken(String toEmail, String token) {
        sendOrThrow(toEmail, "Reset your OpenPal password",
            "We received a request to reset your OpenPal password.\n\n"
            + "Your reset token is: " + token + "\n\n"
            + "It expires in 30 minutes. If you didn't request this, you can ignore this email.");
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

    /**
     * Notifies the moderation inbox when a user blocks another user, so a human
     * can review the potentially objectionable content. Best-effort: never
     * throws, so blocking always succeeds for the user regardless of email.
     */
    @Async
    public void sendUserBlockedAlert(String blockerUsername, String blockedUsername, String reason) {
        String to = (moderationEmail != null && !moderationEmail.isBlank())
                ? moderationEmail
                : fromAddress;
        if (to == null || to.isBlank()) {
            System.out.println("[EmailService] no moderation address configured; "
                + "user @" + blockerUsername + " blocked @" + blockedUsername
                + (reason == null ? "" : " (reason: " + reason + ")"));
            return;
        }
        String body = "@" + blockerUsername + " has blocked @" + blockedUsername + ".\n\n"
            + "Reason: " + (reason == null || reason.isBlank() ? "(none given)" : reason) + "\n\n"
            + "Please review @" + blockedUsername + "'s account and content for policy "
            + "violations and take action if warranted.";
        send(to, "User blocked: @" + blockedUsername + " (by @" + blockerUsername + ")", body);
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
     * Delivers an email via Brevo. Throws on any non-2xx response or transport
     * error so critical paths (the signup code) can react. When no API key is
     * configured we fall back to logging — handy for local dev, but note the
     * email is NOT actually delivered in that mode.
     */
    private void sendOrThrow(String toEmail, String subject, String body) {
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("[EmailService] BREVO_API_KEY not set. Logging instead of sending:\n"
                + subject + " -> " + toEmail + "\n" + body);
            return;
        }

        Map<String, Object> payload = Map.of(
            "sender", Map.of("name", fromName, "email", fromAddress),
            "to", List.of(Map.of("email", toEmail)),
            "subject", subject,
            "textContent", body
        );

        String requestBody;
        try {
            requestBody = json.writeValueAsString(payload);
        } catch (Exception e) {
            throw new IllegalStateException("could not serialize email payload", e);
        }

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BREVO_ENDPOINT))
            .timeout(Duration.ofSeconds(15))
            .header("api-key", apiKey)
            .header("Content-Type", "application/json")
            .header("accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response;
        try {
            response = http.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            throw new IllegalStateException("email transport error: " + e.getMessage(), e);
        }

        if (response.statusCode() / 100 != 2) {
            throw new IllegalStateException(
                "Brevo rejected the email (HTTP " + response.statusCode() + "): " + response.body());
        }
    }
}
