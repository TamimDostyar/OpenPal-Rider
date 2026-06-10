package openpal.services.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JsonTokenWeb {

    private final SecretKey key;

    public JsonTokenWeb(@Value("${openpal.jwt.secret}") String secret) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String issueToken(String userID, int tokenVersion) {
        return Jwts.builder()
            .subject(userID)
            .issuer("OpenPalSecurity")
            .claim("role", "user")
            .claim("ver", tokenVersion)
            .issuedAt(new Date())
            .signWith(key)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public int getTokenVersion(String token) {
        Integer ver = parseClaims(token).get("ver", Integer.class);
        return ver == null ? 0 : ver;
    }
}
