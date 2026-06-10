package openpal.services.blocks;


import openpal.dto.blocks.Block;
import openpal.dto.blocks.BlockResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.services.security.AuthSupport;
import openpal.services.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.blocksDB.BlockDB;
import openpal.database.blocksDB.BlockRepository;
import openpal.database.reportsDB.ReportDB;
import openpal.database.reportsDB.ReportRepository;
import openpal.database.reportsDB.ReportTargetType;
import openpal.services.EmailService;

@Component
public class BlockManager {

    private static final int MAX_REASON_LENGTH = 2000;

    private final BlockRepository blockRepo;
    private final ProfileRepository profileRepo;
    private final ReportRepository reportRepo;
    private final EmailService emailService;
    private final AuthSupport auth;

    @Autowired
    public BlockManager(BlockRepository blockRepo,
                        ProfileRepository profileRepo,
                        ReportRepository reportRepo,
                        EmailService emailService,
                        AuthSupport auth) {
        this.blockRepo = blockRepo;
        this.profileRepo = profileRepo;
        this.reportRepo = reportRepo;
        this.emailService = emailService;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> block(String authHeader, Block request) {
        CreateProfileDB blocker;
        try {
            blocker = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (request == null || request.getUsername() == null || request.getUsername().isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "username is required");
        }
        String reason = request.getReason();
        if (reason != null && reason.length() > MAX_REASON_LENGTH) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "reason exceeds " + MAX_REASON_LENGTH + " characters");
        }

        Optional<CreateProfileDB> targetOpt = profileRepo.findByUsername(request.getUsername());
        if (targetOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "user not found");
        }
        CreateProfileDB target = targetOpt.get();
        if (target.getEmail().equalsIgnoreCase(blocker.getEmail())) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "cannot block yourself");
        }

        String cleanReason = reason == null || reason.isBlank() ? null : reason.trim();

        // Idempotent: blocking again just confirms the existing block.
        if (blockRepo.existsByBlockerEmailIgnoreCaseAndBlockedEmailIgnoreCase(
                blocker.getEmail(), target.getEmail())) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "user already blocked");
            return ResponseEntity.ok(body);
        }

        BlockDB saved = blockRepo.save(new BlockDB(
                blocker.getEmail(),
                blocker.getUsername(),
                target.getEmail(),
                target.getUsername(),
                cleanReason
        ));

        // A block is also a signal to us that content may be objectionable.
        // Persist a report so it surfaces in the same moderation queue, and
        // email the moderation inbox so a human is notified right away.
        reportRepo.save(new ReportDB(
                blocker.getEmail(),
                blocker.getUsername(),
                ReportTargetType.USER,
                target.getEmail(),
                "User blocked",
                cleanReason
        ));
        emailService.sendUserBlockedAlert(
                blocker.getUsername(), target.getUsername(), cleanReason);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "user blocked");
        body.put("block", BlockResponse.from(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<Map<String, Object>> unblock(String authHeader, String username) {
        CreateProfileDB blocker;
        try {
            blocker = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (username == null || username.isBlank()) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "username is required");
        }
        Optional<CreateProfileDB> targetOpt = profileRepo.findByUsername(username);
        if (targetOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "user not found");
        }
        blockRepo.deleteByBlockerEmailIgnoreCaseAndBlockedEmailIgnoreCase(
                blocker.getEmail(), targetOpt.get().getEmail());

        Map<String, Object> body = new HashMap<>();
        body.put("message", "user unblocked");
        return ResponseEntity.ok(body);
    }

    public ResponseEntity<?> listMine(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        List<BlockDB> blocks = blockRepo
                .findByBlockerEmailIgnoreCaseOrderByCreatedAtDesc(caller.getEmail());
        List<BlockResponse> out = new ArrayList<>(blocks.size());
        for (BlockDB b : blocks) out.add(BlockResponse.from(b));
        return ResponseEntity.ok(out);
    }
}
