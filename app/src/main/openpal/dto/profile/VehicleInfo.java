package openpal.dto.profile;

public class VehicleInfo {
    private String licensePlate;
    private String make;
    private String model;
    private String color;

    public VehicleInfo() {
    }

    public String getLicensePlate() { return this.licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getMake() { return this.make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return this.model; }
    public void setModel(String model) { this.model = model; }

    public String getColor() { return this.color; }
    public void setColor(String color) { this.color = color; }
}
