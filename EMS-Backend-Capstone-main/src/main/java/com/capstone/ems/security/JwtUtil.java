package com.capstone.ems.security;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Dotenv dotenv = Dotenv.load();

    // Load secret key from .env file
    private final String SECRET = dotenv.get("JWT_SECRET");

    // Load expiration if needed, else default 5 hours
    private final long EXPIRATION_MS = Long.parseLong(
            dotenv.get("JWT_EXPIRATION_MS", "18000000") // default 5 hours = 18,000,000 ms
    );

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String username, String role, Long employeeId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("employeeId", employeeId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Long extractEmployeeId(String token) {
        return extractAllClaims(token).get("employeeId", Long.class);
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

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean isTokenValid(String token) {
        try {
            if (isTokenExpired(token)) {
                return false;
            }

            extractUsername(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}