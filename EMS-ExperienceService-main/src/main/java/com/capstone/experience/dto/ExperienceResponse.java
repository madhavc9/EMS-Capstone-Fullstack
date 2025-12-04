package com.capstone.experience.dto;

public class ExperienceResponse {

    private Long id;
    private Long employeeId;
    private String techStack;
    private String company;
    private Integer years;

    public ExperienceResponse(Long id, Long employeeId, String techStack, String company, Integer years) {
        this.id = id;
        this.employeeId = employeeId;
        this.techStack = techStack;
        this.company = company;
        this.years = years;
    }

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public String getTechStack() { return techStack; }
    public String getCompany() { return company; }
    public Integer getYears() { return years; }
}
