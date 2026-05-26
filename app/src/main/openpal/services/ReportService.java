package openpal.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import openpal.controllers.reports.Report;
import openpal.controllers.reports.ReportManager;

@RestController
@RequestMapping("api/reports")
public class ReportService {

    private final ReportManager manager;

    @Autowired
    public ReportService(ReportManager manager) {
        this.manager = manager;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Report request) {
        return manager.create(authHeader, request);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return manager.listMine(authHeader);
    }
}
