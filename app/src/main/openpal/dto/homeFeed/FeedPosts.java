package openpal.dto.homeFeed;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request body for the create-post feed endpoint. Identity fields are taken
 * from the caller's JWT, so this DTO carries only the ride details.
 */
public class FeedPosts {
    private String origin;
    private Double originLat;
    private Double originLng;
    private String originPlaceId;

    private String destination;
    private Double destLat;
    private Double destLng;
    private String destPlaceId;

    private BigDecimal price;
    private Integer seats;
    private LocalDateTime departureTime;
    private String vehicleInfo;
    private String description;
    private String recurringDays;
    private String postType;


    public FeedPosts() {
    }

    public String getOrigin() { return this.origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public Double getOriginLat() { return this.originLat; }
    public void setOriginLat(Double originLat) { this.originLat = originLat; }

    public Double getOriginLng() { return this.originLng; }
    public void setOriginLng(Double originLng) { this.originLng = originLng; }

    public String getOriginPlaceId() { return this.originPlaceId; }
    public void setOriginPlaceId(String originPlaceId) { this.originPlaceId = originPlaceId; }

    public String getDestination() { return this.destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getDestLat() { return this.destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return this.destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public String getDestPlaceId() { return this.destPlaceId; }
    public void setDestPlaceId(String destPlaceId) { this.destPlaceId = destPlaceId; }

    public String getRecurringDays() { return this.recurringDays; }
    public void setRecurringDays(String recurringDays) { this.recurringDays = recurringDays; }

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

    public String getPostType(){
        return this.postType;
    }
    public void setPostType(String newPostType){
        this.postType = newPostType;
    }
}
