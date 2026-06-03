package openpal.controllers.blocks;

import java.time.LocalDateTime;
import java.util.UUID;

import openpal.database.blocksDB.BlockDB;

public class BlockResponse {
    private UUID id;
    private String blockedUsername;
    private String reason;
    private LocalDateTime createdAt;

    public BlockResponse() {
    }

    public static BlockResponse from(BlockDB b) {
        BlockResponse out = new BlockResponse();
        out.id = b.getId();
        out.blockedUsername = b.getBlockedUsername();
        out.reason = b.getReason();
        out.createdAt = b.getCreatedAt();
        return out;
    }

    public UUID getId() { return this.id; }
    public String getBlockedUsername() { return this.blockedUsername; }
    public String getReason() { return this.reason; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
}
