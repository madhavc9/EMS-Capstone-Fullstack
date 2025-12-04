package com.capstone.experience.security;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Dotenv dotenv = Dotenv.load();
    private final String SECRET = dotenv.get("JWT_SECRET");
	
	//private final String SECRET ="mysupersecretjwtkey_1234567890_secure";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractEmployeeId(String token) {
        return extractAllClaims(token).get("employeeId", Long.class);
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public boolean isTokenExpired(String token) {
        Date exp = extractExpiration(token);
        return exp != null && exp.before(new Date());
    }

    public boolean isTokenValid(String token) {
        try {
            if (isTokenExpired(token)) return false;
            extractUsername(token); // force parse
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
