package com.capstone.ems.service;

import com.capstone.ems.dto.AuthRequest;
import com.capstone.ems.dto.AuthResponse;
import com.capstone.ems.dto.CreateUserRequest;
import com.capstone.ems.model.Employee;
import com.capstone.ems.model.UserEntity;
import com.capstone.ems.repo.EmployeeRepository;
import com.capstone.ems.repo.UserRepository;
import com.capstone.ems.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    
    public AuthService(UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @PostConstruct
    public void ensureDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            System.out.println("Creating default admin...");

            Employee adminEmp = new Employee();
            adminEmp.setName("Admin User");
            adminEmp.setEmail("admin@ems.com");
            adminEmp.setDesignation("Administrator");
            adminEmp.setSalary(new BigDecimal("60000"));
            adminEmp.setBirthDate(LocalDate.of(1990, 1, 1)); 
            Employee savedEmp = employeeRepository.save(adminEmp);

            UserEntity adminUser = new UserEntity();
            adminUser.setUsername("admin");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123")); 
            adminUser.setRole("ADMIN");
            adminUser.setEmployee(savedEmp);
            userRepository.save(adminUser);
        }
    }

    public AuthResponse loginWithRole(AuthRequest request, String requiredRole) {
        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/password");
        }
        if (!user.getRole().equalsIgnoreCase(requiredRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: wrong login portal");
        }
        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), employeeId);
        return new AuthResponse(token, user.getRole(), employeeId);
    }

    public String createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists");
        }
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee not found"));
        
        UserEntity user = new UserEntity();
        user.setUsername(request.getUsername());
        user.setRole(request.getRole());
        user.setEmployee(employee);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return "User created successfully";
    }

    // -------------------- FORGOT PASSWORD (EXTRACT USERNAME) --------------------
    public void forgotPassword(String securityKey, String newPassword) {
        if (securityKey == null || securityKey.length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Security Key format");
        }

      
        String extractedYear = securityKey.substring(securityKey.length() - 4);
        String extractedUsername = securityKey.substring(0, securityKey.length() - 4);

        //Find User
        UserEntity user = userRepository.findByUsername(extractedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found for the provided key"));
        
        if (user.getEmployee() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No employee record linked");
        }

        //Verify Database Year
        int dbYear = user.getEmployee().getBirthDate().getYear();
        String dbYearStr = String.valueOf(dbYear);

        if (!dbYearStr.equals(extractedYear)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Security Key verification failed (Year mismatch)");
        }

        //Update Password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // -------------------- UPDATED: ADMIN RESET CREDENTIALS --------------------
    public void resetCredentials(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        
        String derivedUsername = emp.getEmail().split("@")[0];
        
        UserEntity user = userRepository.findByUsername(derivedUsername)
                 .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Linked user account not found"));

        
        int day = emp.getBirthDate().getDayOfMonth();
        String datePart = String.format("%02d", day);
        
        String defaultPass = user.getUsername() + "$$" + datePart;

        user.setPasswordHash(passwordEncoder.encode(defaultPass));
        userRepository.save(user);
        
        System.out.println("Admin reset password for " + user.getUsername() + " to: " + defaultPass);

        //SEND RESET NOTIFICATION EMAIL
        emailService.sendResetNotification(
            emp.getEmail(),
            emp.getName(),
            user.getUsername(),
            defaultPass 
        );
    }
}