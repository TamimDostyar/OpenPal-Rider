package openpal.services;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.admin.AdminManager;

/**
 * Admin/moderation API. All routes are gated by the admin allowlist
 * (env ADMIN_EMAILS) inside {@link AdminManager}.
 */
@RestController
@RequestMapping("api/admin")
public class AdminService {

    private final AdminManager manager;

    @Autowired
    public AdminService(AdminManager manager) {
        this.manager = manager;
    }

    @GetMapping("/reports")
    public ResponseEntity<?> listReports(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) String status) {
        return manager.listReports(authHeader, status);
    }

    @PatchMapping("/reports/{id}")
    public ResponseEntity<Map<String, Object>> updateReport(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return manager.updateReportStatus(authHeader, id, body == null ? null : body.get("status"));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Map<String, Object>> removePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable UUID id) {
        return manager.removePost(authHeader, id);
    }

    @PostMapping("/users/{username}/ban")
    public ResponseEntity<Map<String, Object>> banUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String username) {
        return manager.banUser(authHeader, username);
    }
}
