package openpal.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.dto.homeFeed.MessagingSys;
import openpal.services.homeFeed.MessagingSysManager;

@RestController
@RequestMapping("api/messages")
public class MessagingSysService {

    private final MessagingSysManager manager;

    @Autowired
    public MessagingSysService(MessagingSysManager manager) {
        this.manager = manager;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> send(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MessagingSys request) {
        return manager.sendMessage(authHeader, request);
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> conversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listConversations(authHeader);
    }

    @GetMapping("/with/{username}")
    public ResponseEntity<?> with(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String username) {
        return manager.listWith(authHeader, username);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.deleteMessage(authHeader, id);
    }
}
