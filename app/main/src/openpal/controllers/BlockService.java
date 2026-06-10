package openpal.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.dto.blocks.Block;
import openpal.services.blocks.BlockManager;

@RestController
@RequestMapping("api/blocks")
public class BlockService {

    private final BlockManager manager;

    @Autowired
    public BlockService(BlockManager manager) {
        this.manager = manager;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> block(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Block request) {
        return manager.block(authHeader, request);
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Map<String, Object>> unblock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String username) {
        return manager.unblock(authHeader, username);
    }

    @GetMapping
    public ResponseEntity<?> mine(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listMine(authHeader);
    }
}
