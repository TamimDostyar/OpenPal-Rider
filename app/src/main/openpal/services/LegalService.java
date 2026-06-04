package openpal.services;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Serves the legal documents (Terms &amp; Conditions, Privacy Policy) as JSON so
 * the app can render the latest copy without an app-store update. Edit the JSON
 * under {@code resources/data/}, commit, and redeploy — clients fetch the new
 * text on next view. Public: no authentication, since these must be readable
 * before a user logs in.
 */
@RestController
@RequestMapping("api/legal")
public class LegalService {

    private final ObjectMapper json = new ObjectMapper();
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @GetMapping(value = "/terms", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> terms() {
        return serve("data/termsContent.json");
    }

    @GetMapping(value = "/privacy", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> privacy() {
        return serve("data/privacyContent.json");
    }

    private ResponseEntity<String> serve(String resourcePath) {
        try {
            String body = cache.computeIfAbsent(resourcePath, this::loadAndValidate);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
        } catch (RuntimeException e) {
            System.err.println("[LegalService] could not load " + resourcePath + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"legal document unavailable\"}");
        }
    }

    /** Reads the resource and validates it parses as JSON before caching. */
    private String loadAndValidate(String resourcePath) {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (in == null) {
                throw new IllegalStateException("resource not found");
            }
            String raw = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            json.readTree(raw); // throws if malformed
            return raw;
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
    }
}
