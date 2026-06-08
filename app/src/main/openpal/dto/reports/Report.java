package openpal.dto.reports;

import java.util.UUID;

import openpal.database.reportsDB.ReportTargetType;

public class Report {
    private ReportTargetType targetType;
    private String targetUsername;
    private UUID targetPostId;
    private String reason;
    private String text;

    public Report() {
    }

    public ReportTargetType getTargetType() { return this.targetType; }
    public void setTargetType(ReportTargetType targetType) { this.targetType = targetType; }

    public String getTargetUsername() { return this.targetUsername; }
    public void setTargetUsername(String targetUsername) { this.targetUsername = targetUsername; }

    public UUID getTargetPostId() { return this.targetPostId; }
    public void setTargetPostId(UUID targetPostId) { this.targetPostId = targetPostId; }

    public String getReason() { return this.reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getText() { return this.text; }
    public void setText(String text) { this.text = text; }
}
