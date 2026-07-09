package openpal.services.homeFeed;


import openpal.dto.homeFeed.MessagingSys;
import openpal.dto.homeFeed.MessagingSysResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.services.security.AuthSupport;
import openpal.services.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.blocksDB.BlockRepository;
import openpal.database.deviceDB.DeviceTokenDB;
import openpal.database.deviceDB.DeviceTokenRepository;
import openpal.database.homeFeedDB.MessagingSysDB;
import openpal.database.homeFeedDB.MessagingSysRepository;
import openpal.services.EmailService;
import openpal.services.notification.PushNotificationService;
@Component
public class MessagingSysManager {

    private static final int MAX_TEXT_LENGTH = 2000;

    private final MessagingSysRepository messageRepo;
    private final ProfileRepository profileRepo;
    private final BlockRepository blockRepo;
    private final AuthSupport auth;
    private final EmailService emailService;

    private final DeviceTokenRepository deviceTokenRepo;
    private final PushNotificationService pushService;

    @Autowired
    public MessagingSysManager(MessagingSysRepository messageRepo,
                            ProfileRepository profileRepo,
                            BlockRepository blockRepo,
                            AuthSupport auth,
                            EmailService emailService,
                            DeviceTokenRepository deviceTokenRepo,
                            PushNotificationService pushService) {
        this.messageRepo = messageRepo;
        this.profileRepo = profileRepo;
        this.blockRepo = blockRepo;
        this.auth = auth;
        this.emailService = emailService;
        this.deviceTokenRepo = deviceTokenRepo;
        this.pushService = pushService;
    }

    public ResponseEntity<Map<String, Object>> sendMessage(String authHeader, MessagingSys request) {
        CreateProfileDB sender;
        try {
            sender = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (request == null || request.getText() == null || request.getText().isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "text is required");
        }
        if (request.getRecipientUsername() == null || request.getRecipientUsername().isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "recipientUsername is required");
        }
        String text = request.getText().trim();
        if (text.length() > MAX_TEXT_LENGTH) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "text exceeds " + MAX_TEXT_LENGTH + " characters");
        }

        Optional<CreateProfileDB> recipientOpt = profileRepo.findByUsername(request.getRecipientUsername());
        if (recipientOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "recipient not found");
        }
        CreateProfileDB recipient = recipientOpt.get();
        if (recipient.getEmail().equalsIgnoreCase(sender.getEmail())) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "cannot message yourself");
        }
        String senderDomain = AuthSupport.emailDomain(sender.getEmail());
        String recipientDomain = AuthSupport.emailDomain(recipient.getEmail());
        if (!senderDomain.equalsIgnoreCase(recipientDomain)) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "can only message users at your school");
        }
        if (blockRepo.existsBetween(sender.getEmail(), recipient.getEmail())) {
            return AuthSupport.error(HttpStatus.FORBIDDEN,
                    "you can't message this user");
        }

        MessagingSysDB saved = messageRepo.save(new MessagingSysDB(
                sender.getEmail(),
                sender.getUsername(),
                recipient.getEmail(),
                recipient.getUsername(),
                request.getBookingId(),
                text
        ));
        emailService.sendNewDirectMessage(recipient.getEmail(), sender.getUsername(), text);
        for (DeviceTokenDB dt : deviceTokenRepo.findByUserEmail(recipient.getEmail())) {
            pushService.send(
                dt.getToken(),
                sender.getUsername(),
                text,
                Map.of("senderUsername", sender.getUsername())
            );
        }
        Map<String, Object> body = new HashMap<>();
        body.put("message", "message sent");
        body.put("data", MessagingSysResponse.from(saved, sender.getName(), recipient.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> listConversations(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        List<MessagingSysDB> all = messageRepo.findInvolving(caller.getEmail());
        Map<String, Map<String, Object>> byOther = new LinkedHashMap<>();
        for (MessagingSysDB m : all) {
            boolean iAmSender = m.getSenderEmail().equalsIgnoreCase(caller.getEmail());
            String otherEmail = iAmSender ? m.getRecipientEmail() : m.getSenderEmail();
            String otherUsername = iAmSender ? m.getRecipientUsername() : m.getSenderUsername();
            String key = otherEmail.toLowerCase();
            if (byOther.containsKey(key)) {
                Map<String, Object> existing = byOther.get(key);
                if (!iAmSender && m.getReadAt() == null) {
                    existing.put("unreadCount", ((int) existing.get("unreadCount")) + 1);
                }
                continue;
            }
            String otherName = profileRepo.findByEmail(otherEmail)
                    .map(CreateProfileDB::getName)
                    .orElse(null);
            String senderName = iAmSender ? caller.getName() : otherName;
            String recipientName = iAmSender ? otherName : caller.getName();
            Map<String, Object> entry = new HashMap<>();
            entry.put("otherUsername", otherUsername);
            entry.put("otherName", otherName);
            entry.put("otherEmail", otherEmail);
            entry.put("lastMessage", MessagingSysResponse.from(m, senderName, recipientName));
            int unread = (!iAmSender && m.getReadAt() == null) ? 1 : 0;
            entry.put("unreadCount", unread);
            byOther.put(key, entry);
        }
        return ResponseEntity.ok(new ArrayList<>(byOther.values()));
    }

    public ResponseEntity<?> listWith(String authHeader, String otherUsername) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<CreateProfileDB> otherOpt = profileRepo.findByUsername(otherUsername);
        if (otherOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "user not found");
        }
        CreateProfileDB other = otherOpt.get();
        LocalDateTime now = LocalDateTime.now();
        messageRepo.markConversationRead(caller.getEmail(), other.getEmail(), now);

        List<MessagingSysDB> convo = messageRepo.findConversation(caller.getEmail(), other.getEmail());
        List<MessagingSysResponse> out = new ArrayList<>(convo.size());
        for (MessagingSysDB m : convo) {
            boolean iAmSender = m.getSenderEmail().equalsIgnoreCase(caller.getEmail());
            String senderName = iAmSender ? caller.getName() : other.getName();
            String recipientName = iAmSender ? other.getName() : caller.getName();
            out.add(MessagingSysResponse.from(m, senderName, recipientName));
        }
        return ResponseEntity.ok(out);
    }

    public ResponseEntity<Map<String, Object>> deleteMessage(String authHeader, java.util.UUID id) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<MessagingSysDB> found = messageRepo.findById(id);
        if (found.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "message not found");
        }
        MessagingSysDB msg = found.get();
        if (!msg.getSenderEmail().equalsIgnoreCase(caller.getEmail())) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "you can only delete your own messages");
        }
        messageRepo.deleteById(id);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "message deleted");
        return ResponseEntity.ok(body);
    }
}
