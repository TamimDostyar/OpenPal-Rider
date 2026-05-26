package openpal.controllers.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.reportsDB.ReportDB;
import openpal.database.reportsDB.ReportRepository;
import openpal.database.reportsDB.ReportTargetType;

@Component
public class ReportManager {

    private static final int MAX_TEXT_LENGTH = 2000;

    private final ReportRepository reportRepo;
    private final ProfileRepository profileRepo;
    private final AuthSupport auth;

    @Autowired
    public ReportManager(ReportRepository reportRepo,
                         ProfileRepository profileRepo,
                         AuthSupport auth) {
        this.reportRepo = reportRepo;
        this.profileRepo = profileRepo;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> create(String authHeader, Report request) {
        CreateProfileDB reporter;
        try {
            reporter = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (request == null || request.getTargetType() == null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "targetType is required");
        }
        if (request.getReason() == null || request.getReason().isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "reason is required");
        }
        String text = request.getText();
        if (text != null && text.length() > MAX_TEXT_LENGTH) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "text exceeds " + MAX_TEXT_LENGTH + " characters");
        }

        String targetId;
        if (request.getTargetType() == ReportTargetType.USER) {
            if (request.getTargetUsername() == null || request.getTargetUsername().isBlank()) {
                return AuthSupport.error(HttpStatus.BAD_REQUEST,
                        "targetUsername is required for USER reports");
            }
            Optional<CreateProfileDB> target = profileRepo.findByUsername(request.getTargetUsername());
            if (target.isEmpty()) {
                return AuthSupport.error(HttpStatus.NOT_FOUND, "target user not found");
            }
            if (target.get().getEmail().equalsIgnoreCase(reporter.getEmail())) {
                return AuthSupport.error(HttpStatus.BAD_REQUEST, "cannot report yourself");
            }
            targetId = target.get().getEmail();
        } else {
            if (request.getTargetPostId() == null) {
                return AuthSupport.error(HttpStatus.BAD_REQUEST,
                        "targetPostId is required for POST reports");
            }
            targetId = request.getTargetPostId().toString();
        }

        ReportDB saved = reportRepo.save(new ReportDB(
                reporter.getEmail(),
                reporter.getUsername(),
                request.getTargetType(),
                targetId,
                request.getReason().trim(),
                text == null ? null : text.trim()
        ));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "report submitted");
        body.put("report", ReportResponse.from(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> listMine(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        List<ReportDB> reports = reportRepo
                .findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(caller.getEmail());
        List<ReportResponse> out = new ArrayList<>(reports.size());
        for (ReportDB r : reports) out.add(ReportResponse.from(r));
        return ResponseEntity.ok(out);
    }
}
