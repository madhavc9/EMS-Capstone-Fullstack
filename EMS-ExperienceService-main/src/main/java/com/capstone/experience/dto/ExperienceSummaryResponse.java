package com.capstone.experience.dto;

public class ExperienceSummaryResponse {

    private String techStack;
    private Integer totalYears;

    public ExperienceSummaryResponse(String techStack, Integer totalYears) {
        this.techStack = techStack;
        this.totalYears = totalYears;
    }

    public String getTechStack() { return techStack; }
    public Integer getTotalYears() { return totalYears; }
}
