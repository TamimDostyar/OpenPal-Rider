package openpal.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.dto.bookings.Booking;
import openpal.services.bookings.BookingManager;

@RestController
@RequestMapping("api/bookings")
public class BookingService {

    private final BookingManager manager;

    @Autowired
    public BookingService(BookingManager manager) {
        this.manager = manager;
    }

    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> request(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Booking request) {
        return manager.request(authHeader, request);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Map<String, Object>> accept(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.accept(authHeader, id);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<Map<String, Object>> decline(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.decline(authHeader, id);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancel(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.cancel(authHeader, id);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> complete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.complete(authHeader, id);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listMine(authHeader);
    }

    @GetMapping("/incoming")
    public ResponseEntity<?> incoming(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listIncoming(authHeader);
    }
}
