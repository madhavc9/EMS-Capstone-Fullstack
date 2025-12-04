package com.capstone.ems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; 
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate; 

public class EmployeeDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Designation is required")
    private String designation;

    @Positive(message = "Salary must be positive")
    private BigDecimal salary;

    // --- NEW FIELD ---
    @NotNull(message = "Date of Birth is required")
    private LocalDate birthDate;
    
    @NotBlank(message = "Role is required")
    private String role; 

    public EmployeeDto() {
    }

    
    public EmployeeDto(Long id, String name, String email, String designation, BigDecimal salary, LocalDate birthDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.designation = designation;
        this.salary = salary;
        this.birthDate = birthDate;
    }

    

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}