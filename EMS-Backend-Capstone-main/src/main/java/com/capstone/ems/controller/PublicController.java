package com.capstone.ems.controller;

import com.capstone.ems.dto.HomeStatsDto;
import com.capstone.ems.model.Employee;
import com.capstone.ems.repo.EmployeeRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/public")
//@CrossOrigin(origins = "*")
public class PublicController {

    private final EmployeeRepository employeeRepository;

    public PublicController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/stats")
    public HomeStatsDto getHomeStats() {
        List<Employee> employees = employeeRepository.findAll();

        long total = employees.size();
        
        // Count employees joined in the last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newJoinees = employees.stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        // Calculate Average Salary
        BigDecimal totalSalary = employees.stream()
                .map(Employee::getSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgSalary = (total > 0) 
                ? totalSalary.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        return new HomeStatsDto(total, newJoinees, avgSalary);
    }
}