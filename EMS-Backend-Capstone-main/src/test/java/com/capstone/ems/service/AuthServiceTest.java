package com.capstone.ems.service;

import com.capstone.ems.dto.AuthRequest;
import com.capstone.ems.dto.AuthResponse;
import com.capstone.ems.dto.CreateUserRequest;
import com.capstone.ems.model.Employee;
import com.capstone.ems.model.UserEntity;
import com.capstone.ems.repo.EmployeeRepository;
import com.capstone.ems.repo.UserRepository;
import com.capstone.ems.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    private UserEntity testUser;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setName("Test Employee");
        testEmployee.setEmail("test@ems.com");
        testEmployee.setDesignation("Developer");
        testEmployee.setSalary(new BigDecimal("50000"));
        testEmployee.setBirthDate(LocalDate.of(1990, 1, 1));

        testUser = new UserEntity();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("$2a$10$..."); // Encoded password
        testUser.setRole("USER");
        testUser.setEmployee(testEmployee);
    }

    @Test
    void ensureDefaultAdmin_CreatesAdminIfNotExists() {
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);
        when(passwordEncoder.encode("admin123")).thenReturn("encodedAdminPass");

        authService.ensureDefaultAdmin();

        verify(employeeRepository).save(any(Employee.class));
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void ensureDefaultAdmin_DoesNothingIfAdminExists() {
        when(userRepository.existsByUsername("admin")).thenReturn(true);

        authService.ensureDefaultAdmin();

        verifyNoInteractions(employeeRepository, passwordEncoder, userRepository);
    }

    @Test
    void loginWithRole_SuccessfulAdminLogin() {
        AuthRequest request = new AuthRequest("admin", "admin123");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("admin123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken("admin", "ADMIN", 1L)).thenReturn("jwt-token");

        AuthResponse response = authService.loginWithRole(request, "ADMIN");

        assertEquals("jwt-token", response.getToken());
        assertEquals("ADMIN", response.getRole());
        verify(jwtUtil).generateToken(eq("admin"), eq("ADMIN"), eq(1L));
    }

    @Test
    void loginWithRole_InvalidCredentials_ThrowsUnauthorized() {
        AuthRequest request = new AuthRequest("testuser", "wrongpass");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpass", testUser.getPasswordHash())).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.loginWithRole(request, "USER"));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void loginWithRole_WrongRole_ThrowsForbidden() {
        AuthRequest request = new AuthRequest("testuser", "correctpass");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("correctpass", testUser.getPasswordHash())).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.loginWithRole(request, "ADMIN"));
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void createUser_Success() {
        CreateUserRequest request = new CreateUserRequest("newuser", "newpass", "USER", 1L);
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(passwordEncoder.encode("newpass")).thenReturn("encodedNewPass");

        String result = authService.createUser(request);

        assertEquals("User created successfully", result);
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void createUser_UsernameExists_ThrowsBadRequest() {
        CreateUserRequest request = new CreateUserRequest("existing", "pass", "USER", 1L);
        when(userRepository.existsByUsername("existing")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.createUser(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createUser_EmployeeNotFound_ThrowsBadRequest() {
        CreateUserRequest request = new CreateUserRequest("newuser", "pass", "USER", 999L);
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.createUser(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void forgotPassword_Success() {
        String securityKey = "testuser1990";
        String newPassword = "newpass";
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newpass")).thenReturn("encodedNewPass");

        authService.forgotPassword(securityKey, newPassword);

        verify(passwordEncoder).encode("newpass");
        verify(userRepository).save(testUser);
    }

    @Test
    void forgotPassword_InvalidKey_ThrowsBadRequest() {
        String securityKey = "short";
        String newPassword = "newpass";

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.forgotPassword(securityKey, newPassword));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void forgotPassword_UserNotFound_ThrowsNotFound() {
        String securityKey = "nonuser1990";
        String newPassword = "newpass";
        when(userRepository.findByUsername("nonuser")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.forgotPassword(securityKey, newPassword));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void forgotPassword_YearMismatch_ThrowsUnauthorized() {
        String securityKey = "testuser2000"; // Mismatch
        String newPassword = "newpass";
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.forgotPassword(securityKey, newPassword));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void resetCredentials_Success() {
        testEmployee.setEmail("test@ems.com");
        testEmployee.setBirthDate(LocalDate.of(1990, 1, 1)); // Day 1
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("test")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("test$$01")).thenReturn("encodedDefault");

        authService.resetCredentials(1L);

        verify(passwordEncoder).encode(eq("test$$01"));
        verify(emailService).sendResetNotification(eq("test@ems.com"), eq("Test Employee"), eq("test"), eq("test$$01"));
    }

    @Test
    void resetCredentials_EmployeeNotFound_ThrowsNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.resetCredentials(999L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void resetCredentials_UserNotFound_ThrowsNotFound() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("test")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.resetCredentials(1L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}