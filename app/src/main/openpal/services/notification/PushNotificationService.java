package openpal.services.notification;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import openpal.database.deviceDB.DeviceTokenDB;
import openpal.database.deviceDB.DeviceTokenRepository;

/**
 * Delivers push notifications through Expo's push service (HTTPS).
 *
 * <p>The mobile app is built with Expo and hands us Expo push tokens
 * ({@code ExponentPushToken[...]}), so we talk to Expo's REST endpoint rather
 * than Firebase. Same shape as {@link openpal.services.EmailService}: plain
 * HTTPS via {@link HttpClient}, no vendor SDK, best-effort (never throws to the
 * caller).
 *
 * <p>Expo requires no API key for sending. Tokens that Expo reports as
 * {@code DeviceNotRegistered} are pruned so we stop pushing to dead devices.
 */
@Component
public class PushNotificationService {

    private static final String EXPO_ENDPOINT = "https://exp.host/--/api/v2/push/send";

    /** Expo accepts at most 100 messages per request. */
    private static final int MAX_MESSAGES_PER_BATCH = 100;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper json = new ObjectMapper();

    private final DeviceTokenRepository deviceTokenRepo;

    public PushNotificationService(DeviceTokenRepository deviceTokenRepo) {
        this.deviceTokenRepo = deviceTokenRepo;
    }

    /**
     * Delivers a push to every device registered to {@code userEmail}. Runs off
     * the caller's thread so it never adds latency to the request that triggered
     * it.
     */
    @Async
    public void sendToUser(String userEmail, String title, String body, Map<String, String> data) {
        List<DeviceTokenDB> devices = deviceTokenRepo.findByUserEmail(userEmail);
        if (devices.isEmpty()) {
            return;
        }
        List<String> tokens = new ArrayList<>(devices.size());
        for (DeviceTokenDB dt : devices) {
            tokens.add(dt.getToken());
        }
        sendInBatches(tokens, title, body, data);
    }

    /**
     * Broadcasts a push to every registered device — for app-wide messages like
     * announcements. Off the caller's thread; dead tokens are pruned as usual.
     */
    @Async
    public void sendToAll(String title, String body, Map<String, String> data) {
        sendInBatches(deviceTokenRepo.findAllTokens(), title, body, data);
    }

    private void sendInBatches(List<String> tokens, String title, String body, Map<String, String> data) {
        for (int start = 0; start < tokens.size(); start += MAX_MESSAGES_PER_BATCH) {
            List<String> batch = tokens.subList(start,
                    Math.min(start + MAX_MESSAGES_PER_BATCH, tokens.size()));
            sendBatch(batch, title, body, data);
        }
    }

    private void sendBatch(List<String> tokens, String title, String body, Map<String, String> data) {
        List<Map<String, Object>> messages = new ArrayList<>(tokens.size());
        for (String token : tokens) {
            messages.add(Map.of(
                    "to", token,
                    "title", title,
                    "body", body,
                    "data", data
            ));
        }

        String requestBody;
        try {
            requestBody = json.writeValueAsString(messages);
        } catch (Exception e) {
            System.err.println("[PushNotificationService] could not serialize push payload: "
                    + e.getMessage());
            return;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(EXPO_ENDPOINT))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response;
        try {
            response = http.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            System.err.println("[PushNotificationService] push transport error: " + e.getMessage());
            return;
        }

        if (response.statusCode() / 100 != 2) {
            System.err.println("[PushNotificationService] Expo rejected the push (HTTP "
                    + response.statusCode() + "): " + response.body());
            return;
        }

        pruneDeadTokens(tokens, response.body());
    }

    /**
     * Reads Expo's per-message tickets and deletes any token Expo reports as
     * {@code DeviceNotRegistered}. Other errors are transient and left alone.
     * The tickets array is positional — index i corresponds to tokens.get(i).
     */
    private void pruneDeadTokens(List<String> tokens, String responseBody) {
        JsonNode tickets;
        try {
            tickets = json.readTree(responseBody).path("data");
        } catch (Exception e) {
            System.err.println("[PushNotificationService] could not parse Expo response: "
                    + e.getMessage());
            return;
        }
        if (!tickets.isArray()) {
            return;
        }
        for (int i = 0; i < tickets.size() && i < tokens.size(); i++) {
            JsonNode ticket = tickets.get(i);
            if (!"error".equals(ticket.path("status").asText())) {
                continue;
            }
            String errorType = ticket.path("details").path("error").asText();
            if ("DeviceNotRegistered".equals(errorType)) {
                deviceTokenRepo.deleteByToken(tokens.get(i));
            } else {
                System.err.println("[PushNotificationService] push failed for token "
                        + tokens.get(i) + ": " + ticket.path("message").asText());
            }
        }
    }
}
