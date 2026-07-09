package openpal.services.notification;

import java.util.Map;

import org.springframework.stereotype.Component;

import openpal.database.deviceDB.DeviceTokenRepository;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Component
public class PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepo;

    public PushNotificationService(DeviceTokenRepository deviceTokenRepo) {
        this.deviceTokenRepo = deviceTokenRepo;
    }

    public void send(String deviceToken, String title, String body, Map<String, String> data) {
        Message message = Message.builder()
                .setToken(deviceToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putAllData(data)
                .build();

        try {
            FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {
            System.err.println("Push send failed for token " + deviceToken + ": " + e.getMessage());
            deviceTokenRepo.deleteByToken(deviceToken);
        }
    }
}