package openpal.controllers.blocks;

public class Block {
    private String username;
    private String reason;

    public Block() {
    }

    public String getUsername() { return this.username; }
    public void setUsername(String username) { this.username = username; }

    public String getReason() { return this.reason; }
    public void setReason(String reason) { this.reason = reason; }
}
