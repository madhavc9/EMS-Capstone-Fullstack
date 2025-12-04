package com.capstone.ems.controller;

import com.capstone.ems.dto.AuthRequest;
import com.capstone.ems.dto.AuthResponse;
import com.capstone.ems.dto.CreateUserRequest;
import com.capstone.ems.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

class ForgotPasswordRequest {
    public String securityKey; 
    public String newPassword;
}

@RestController
@RequestMapping("/auth")
//@CrossOrigin(origins = "*")
@Tag(name = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@RequestBody AuthRequest request) {
        return authService.loginWithRole(request, "ADMIN");
    }

    @PostMapping("/user/login")
    public AuthResponse userLogin(@RequestBody AuthRequest request) {
        return authService.loginWithRole(request, "USER");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-user")
    public String createUser(@RequestBody CreateUserRequest request) {
        return authService.createUser(request);
    }

    // ------------------- UPDATED FORGOT PASSWORD -------------------
    @Operation(summary = "Forgot Password", description = "Resets password using Security Key (Username + BirthYear).")
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        // Only pass securityKey and newPassword
        authService.forgotPassword(request.securityKey, request.newPassword);
        return "Password updated successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/reset-credentials/{employeeId}")
    public String resetCredentials(@PathVariable Long employeeId) {
        authService.resetCredentials(employeeId);
        return "Credentials reset to default";
    }
}