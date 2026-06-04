package openpal.controllers.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.controllers.profile.AccountManager;
import openpal.controllers.reports.ReportResponse;
import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.homeFeedDB.FeedPostsDB;
import openpal.database.homeFeedDB.FeedPostsRepository;
import openpal.database.reportsDB.ReportDB;
import openpal.database.reportsDB.ReportRepository;
import openpal.database.reportsDB.ReportStatus;

/**
 * Moderation actions for admins: review reports, remove content, and eject
 * abusive users. Satisfies Apple guideline 1.2's requirement for a mechanism to
 * remove objectionable content and eject the users behind it. Every method is
 * gated by {@link AuthSupport#requireAdmin}.
 */
@Component
public class AdminManager {

    private final ReportRepository reportRepo;
    private final FeedPostsRepository feedRepo;
    private final ProfileRepository profileRepo;
    private final AccountManager accountManager;
    private final AuthSupport auth;

    @Autowired
    public AdminManager(ReportRepository reportRepo,
                        FeedPostsRepository feedRepo,
                        ProfileRepository profileRepo,
                        AccountManager accountManager,
                        AuthSupport auth) {
        this.reportRepo = reportRepo;
        this.feedRepo = feedRepo;
        this.profileRepo = profileRepo;
        this.accountManager = accountManager;
        this.auth = auth;
    }

    public ResponseEntity<?> listReports(String authHeader, String statusParam) {
        try {
            auth.requireAdmin(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        List<ReportDB> reports;
        if (statusParam != null && !statusParam.isBlank()) {
            ReportStatus status;
            try {
                status = ReportStatus.valueOf(statusParam.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return AuthSupport.error(HttpStatus.BAD_REQUEST, "unknown status: " + statusParam);
            }
            reports = reportRepo.findByStatusOrderByCreatedAtDesc(status);
        } else {
            reports = reportRepo.findAllByOrderByCreatedAtDesc();
        }

        List<ReportResponse> out = new ArrayList<>(reports.size());
        for (ReportDB r : reports) out.add(ReportResponse.from(r));
        return ResponseEntity.ok(out);
    }

    public ResponseEntity<Map<String, Object>> updateReportStatus(
            String authHeader, UUID reportId, String statusParam) {
        try {
            auth.requireAdmin(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (statusParam == null || statusParam.isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "status is required");
        }
        ReportStatus status;
        try {
            status = ReportStatus.valueOf(statusParam.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "unknown status: " + statusParam);
        }
        Optional<ReportDB> found = reportRepo.findById(reportId);
        if (found.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "report not found");
        }
        ReportDB report = found.get();
        report.setStatus(status);
        reportRepo.save(report);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "report updated");
        body.put("report", ReportResponse.from(report));
        return ResponseEntity.ok(body);
    }

    public ResponseEntity<Map<String, Object>> removePost(String authHeader, UUID postId) {
        try {
            auth.requireAdmin(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<FeedPostsDB> found = feedRepo.findById(postId);
        if (found.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "post not found");
        }
        feedRepo.deleteById(postId);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "post removed");
        return ResponseEntity.ok(body);
    }

    public ResponseEntity<Map<String, Object>> banUser(String authHeader, String username) {
        CreateProfileDB admin;
        try {
            admin = auth.requireAdmin(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<CreateProfileDB> targetOpt = profileRepo.findByUsername(username);
        if (targetOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "user not found");
        }
        CreateProfileDB target = targetOpt.get();
        if (target.getEmail().equalsIgnoreCase(admin.getEmail())) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "you can't ban yourself");
        }
        // Reuse the same teardown as self-service account deletion.
        accountManager.purgeUser(target);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "user ejected");
        return ResponseEntity.ok(body);
    }
}
