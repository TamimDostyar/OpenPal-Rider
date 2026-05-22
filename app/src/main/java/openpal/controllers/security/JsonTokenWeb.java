package openpal.controllers.security;

import io.jsonwebtoken.Jwts;
import javax.crypto.SecretKey;
import java.util.Date;


// provide json token if the user is valid - generete json token
public class JsonTokenWeb{
    private static final SecretKey KEY = Jwts.SIG.HS256.key().build();

    public String issueToken(String userID){
        return Jwts.builder()
            .subject(userID)
            .issuer("OpenPalSecurity")
            .claim("role", "user")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600_000))
            .signWith(KEY)
            .compact();
    }

    public String parseToken(String token) {
        return Jwts.parser()
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}