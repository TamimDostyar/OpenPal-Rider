package openpal.database.deviceDB;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "device_tokens",
        indexes = @Index(name = "idx_device_user_email", columnList = "userEmail"))
public class DeviceTokenDB {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String platform; // "web", "ios", "android"

    private LocalDateTime updatedAt;

    public DeviceTokenDB() {}

    public DeviceTokenDB(String userEmail, String token, String platform) {
        this.userEmail = userEmail;
        this.token = token;
        this.platform = platform;
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}