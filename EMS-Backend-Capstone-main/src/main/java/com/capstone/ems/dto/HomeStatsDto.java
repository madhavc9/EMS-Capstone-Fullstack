package com.capstone.ems.dto;

import java.math.BigDecimal;

public class HomeStatsDto {
    private long totalEmployees;
    private long newJoinees;
    private BigDecimal avgSalary;

    public HomeStatsDto(long totalEmployees, long newJoinees, BigDecimal avgSalary) {
        this.totalEmployees = totalEmployees;
        this.newJoinees = newJoinees;
        this.avgSalary = avgSalary;
    }

    
    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getNewJoinees() { return newJoinees; }
    public void setNewJoinees(long newJoinees) { this.newJoinees = newJoinees; }

    public BigDecimal getAvgSalary() { return avgSalary; }
    public void setAvgSalary(BigDecimal avgSalary) { this.avgSalary = avgSalary; }
}