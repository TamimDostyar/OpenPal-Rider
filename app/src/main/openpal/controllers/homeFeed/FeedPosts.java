package openpal.controllers.homeFeed;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request body for POST /api/feed/create-post. Identity (username, email) is
 * pulled from the caller's JWT, not from this DTO, so we don't expose those
 * fields here.
 */
public class FeedPosts {
    private String origin;
    private String destination;
    private BigDecimal price;
    private Integer seats;
    private LocalDateTime departureTime;
    private String vehicleInfo;
    private String description;

    public FeedPosts() {
    }

    public String getOrigin() { return this.origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return this.destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public BigDecimal getPrice() { return this.price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getSeats() { return this.seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public LocalDateTime getDepartureTime() { return this.departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public String getVehicleInfo() { return this.vehicleInfo; }
    public void setVehicleInfo(String vehicleInfo) { this.vehicleInfo = vehicleInfo; }

    public String getDescription() { return this.description; }
    public void setDescription(String description) { this.description = description; }
}
