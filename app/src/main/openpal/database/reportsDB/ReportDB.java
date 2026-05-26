package openpal.database.reportsDB;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "reports",
    indexes = {
        @Index(name = "idx_reports_reporter", columnList = "reporterEmail"),
        @Index(name = "idx_reports_target", columnList = "targetType,targetId"),
        @Index(name = "idx_reports_status", columnList = "status")
    }
)
public class ReportDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String reporterEmail;

    @Column(nullable = false)
    private String reporterUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportTargetType targetType;

    @Column(nullable = false)
    private String targetId;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    protected ReportDB() {
    }

    public ReportDB(String reporterEmail, String reporterUsername,
                    ReportTargetType targetType, String targetId,
                    String reason, String text) {
        this.reporterEmail = reporterEmail;
        this.reporterUsername = reporterUsername;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.text = text;
        this.status = ReportStatus.OPEN;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return this.id; }
    public String getReporterEmail() { return this.reporterEmail; }
    public String getReporterUsername() { return this.reporterUsername; }
    public ReportTargetType getTargetType() { return this.targetType; }
    public String getTargetId() { return this.targetId; }
    public String getReason() { return this.reason; }
    public String getText() { return this.text; }
    public ReportStatus getStatus() { return this.status; }
    public void setStatus(ReportStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
