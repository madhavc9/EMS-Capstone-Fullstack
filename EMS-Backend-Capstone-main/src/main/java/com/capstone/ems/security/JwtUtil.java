package com.capstone.ems.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String secret;
    private final long expirationMs;

    public JwtUtil(
            @Value("${JWT_SECRET}") String secret,
            @Value("${JWT_EXPIRATION_MS:18000000}") long expirationMs  // Default: 5 hours
    ) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role, Long employeeId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("employeeId", employeeId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
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
            extractUsername(token); // Ensures token is parseable
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}