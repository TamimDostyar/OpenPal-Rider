package openpal.controllers;


import java.util.List;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import openpal.services.homeFeed.AnnouncementManager;
import openpal.dto.homeFeed.Announcement;
import openpal.services.security.AuthSupport;

@RestController
@RequestMapping("api/announcements")
public class AnnouncementService {

    private final AnnouncementManager announcements;
    private final AuthSupport authSupport;

    @Autowired
    public AnnouncementService(AnnouncementManager announcements, AuthSupport authSupport) {
        this.announcements = announcements;
        this.authSupport = authSupport;
    }

    @GetMapping("/read-news")
    public ResponseEntity<Map<String, List>> announcementNews() {
        Map<String, List> data = new HashMap<>();
        data.put("success", announcements.readAnnouncement());
        return ResponseEntity.ok(data);
    }

    @PostMapping("/write-news")
    public ResponseEntity<Map<String, String>> writeNews(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Announcement announcement
    ) {
        authSupport.requireAdmin(authHeader);
        announcements.writeAnnouncement(announcement);
        Map<String, String> data = new HashMap<>();
        data.put("success", "announcement saved");
        return ResponseEntity.ok(data);
    }
}