package openpal.controllers.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * Issues and verifies JWTs. Tokens do NOT expire — they stay valid until the
 * user logs out. Each token carries the user's "token version"; logout bumps
 * that version on the account, which instantly invalidates every older token.
 */
@Component
public class JsonTokenWeb {

    private final SecretKey key;

    public JsonTokenWeb(@Value("${openpal.jwt.secret}") String secret) {
        // accept either a base64-encoded secret or a plain long string
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /** Issues a non-expiring token for the user, stamped with their token version. */
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

    /** Parsed claims of a token; throws if the signature is invalid. */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** The email (subject) a token was issued for. */
    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }

    /** The token-version claim, used to detect tokens revoked by logout. */
    public int getTokenVersion(String token) {
        Integer ver = parseClaims(token).get("ver", Integer.class);
        return ver == null ? 0 : ver;
    }
}
