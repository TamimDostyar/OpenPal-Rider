package openpal.dto.reports;

import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.reportsDB.ReportDB;
import openpal.database.reportsDB.ReportStatus;
import openpal.database.reportsDB.ReportTargetType;

public class ReportResponse {
    private UUID id;
    private String reporterUsername;
    private ReportTargetType targetType;
    private String targetId;
    private String reason;
    private String text;
    private ReportStatus status;
    private LocalDateTime createdAt;

    public ReportResponse() {
    }

    public static ReportResponse from(ReportDB r) {
        ReportResponse out = new ReportResponse();
        out.id = r.getId();
        out.reporterUsername = r.getReporterUsername();
        out.targetType = r.getTargetType();
        out.targetId = r.getTargetId();
        out.reason = r.getReason();
        out.text = r.getText();
        out.status = r.getStatus();
        out.createdAt = r.getCreatedAt();
        return out;
    }

    public UUID getId() { return this.id; }
    public String getReporterUsername() { return this.reporterUsername; }
    public ReportTargetType getTargetType() { return this.targetType; }
    public String getTargetId() { return this.targetId; }
    public String getReason() { return this.reason; }
    public String getText() { return this.text; }
    public ReportStatus getStatus() { return this.status; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
