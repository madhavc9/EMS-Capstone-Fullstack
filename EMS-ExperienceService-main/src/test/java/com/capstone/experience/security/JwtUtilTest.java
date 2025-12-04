package com.capstone.experience.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String testSecret = "myTestSecretKeyThatIsLongEnoughForHS256";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "SECRET", testSecret);
    }

    @Test
    void extractUsername_Success() {
        String token = createMockToken("testuser", "USER", 10L);
        String username = jwtUtil.extractUsername(token);

        assertEquals("testuser", username);
    }

    @Test
    void extractRole_Success() {
        String token = createMockToken("testuser", "USER", 10L);
        String role = jwtUtil.extractRole(token);

        assertEquals("USER", role);
    }

    @Test
    void extractEmployeeId_Success() {
        String token = createMockToken("testuser", "USER", 10L);
        Long employeeId = jwtUtil.extractEmployeeId(token);

        assertEquals(10L, employeeId);
    }

    @Test
    void extractExpiration_Success() {
        String token = createMockToken("testuser", "USER", 10L);
        Date expiration = jwtUtil.extractExpiration(token);

        assertNotNull(expiration);
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = createMockToken("testuser", "USER", 10L);
        boolean valid = jwtUtil.isTokenValid(token);

        assertTrue(valid);
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        String expiredToken = createExpiredMockToken("testuser", "USER", 10L);
        boolean valid = jwtUtil.isTokenValid(expiredToken);

        assertFalse(valid);
    }

    @Test
    void isTokenValid_InvalidToken_ReturnsFalse() {
        String invalidToken = "invalid.token.here";
        boolean valid = jwtUtil.isTokenValid(invalidToken);

        assertFalse(valid);
    }

    private String createMockToken(String username, String role, Long employeeId) {
        Key key = Keys.hmacShaKeyFor(testSecret.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("employeeId", employeeId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                .signWith(key)
                .compact();
    }

    private String createExpiredMockToken(String username, String role, Long employeeId) {
        Key key = Keys.hmacShaKeyFor(testSecret.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("employeeId", employeeId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() - 3600000)) // Past
                .signWith(key)
                .compact();
    }
}