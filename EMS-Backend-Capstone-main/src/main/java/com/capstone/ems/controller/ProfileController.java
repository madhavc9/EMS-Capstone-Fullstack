package com.capstone.ems.controller;



import com.capstone.ems.dto.EmployeeDto;
import com.capstone.ems.model.UserEntity;
import com.capstone.ems.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

 private final EmployeeService employeeService;

 public ProfileController(EmployeeService employeeService) {
     this.employeeService = employeeService;
 }

 @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
 @GetMapping("/me")
 public ResponseEntity<EmployeeDto> getMyProfile() {

     Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     UserEntity user = (UserEntity) auth.getPrincipal(); // you set UserEntity in JwtAuthFilter

     if (user.getEmployee() == null) {
         return ResponseEntity.notFound().build();
     }

     Long employeeId = user.getEmployee().getId();
     EmployeeDto employeeDto = employeeService.getEmployeeById(employeeId);

     return ResponseEntity.ok(employeeDto);
 }
}
