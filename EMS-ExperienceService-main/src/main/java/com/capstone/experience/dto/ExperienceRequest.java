package com.capstone.experience.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ExperienceRequest {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotBlank(message = "Tech stack is required")
    private String techStack;

    private String company;

    @Positive(message = "Years must be greater than zero")
    private Integer years;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getTechStack() { return techStack; }
    public void setTechStack(String techStack) { this.techStack = techStack; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public Integer getYears() { return years; }
    public void setYears(Integer years) { this.years = years; }
}
