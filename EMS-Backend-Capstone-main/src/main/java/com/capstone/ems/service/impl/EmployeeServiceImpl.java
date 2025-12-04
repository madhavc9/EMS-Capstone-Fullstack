package com.capstone.ems.service.impl;

import com.capstone.ems.dto.EmployeeDto;
import com.capstone.ems.exception.BadRequestException;
import com.capstone.ems.exception.NotFoundException;
import com.capstone.ems.model.Employee;
import com.capstone.ems.model.UserEntity;
import com.capstone.ems.repo.EmployeeRepository;
import com.capstone.ems.repo.UserRepository;
import com.capstone.ems.service.EmailService; 
import com.capstone.ems.service.EmployeeService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter; 
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    @Autowired
    private EmailService emailService;

    private EmployeeDto toDto(Employee employee) {
        if (employee == null) return null;
        return new EmployeeDto(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getBirthDate()
        );
    }

    private Employee toEntity(EmployeeDto dto) {
        if (dto == null) return null;
        Employee employee = new Employee();
        employee.setId(dto.getId());
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setDesignation(dto.getDesignation());
        employee.setSalary(dto.getSalary());
        employee.setBirthDate(dto.getBirthDate());
        return employee;
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));
        return toDto(employee);
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        
        
        Employee employee = toEntity(employeeDto);
        employee.setId(null);
        Employee savedEmployee = employeeRepository.save(employee);

        String username = employeeDto.getEmail().split("@")[0];

        
        int day = savedEmployee.getBirthDate().getDayOfMonth();
        String datePart = String.format("%02d", day);
        
        String rawPassword = username + "$$" + datePart; 
        String encodedPassword = passwordEncoder.encode(rawPassword);

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setPasswordHash(encodedPassword);
        user.setRole(employeeDto.getRole());
        user.setEmployee(savedEmployee);

        userRepository.save(user);

        System.out.println("Auto-created user: " + username + " | Password: " + rawPassword);

        // Send Email
        emailService.sendWelcomeEmail(
            savedEmployee.getEmail(), 
            savedEmployee.getName(), 
            username, 
            rawPassword
        );

        return toDto(savedEmployee);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));

        if (!existing.getEmail().equals(employeeDto.getEmail())
                && employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new BadRequestException("Email already in use: " + employeeDto.getEmail());
        }

        existing.setName(employeeDto.getName());
        existing.setEmail(employeeDto.getEmail());
        existing.setDesignation(employeeDto.getDesignation());
        existing.setSalary(employeeDto.getSalary());
        existing.setBirthDate(employeeDto.getBirthDate()); 

        Employee updated = employeeRepository.save(existing);
        return toDto(updated);
    }

    @Override
    @Transactional // Add Transactional to ensure both delete or neither do
    public void deleteEmployee(Long id) {
        // 1. Check if employee exists
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + id));

        // 2. Find and Delete the associated User account first (The Child)
        userRepository.findByEmployeeId(id).ifPresent(user -> {
            userRepository.delete(user);
            System.out.println("Deleted associated User account for Employee ID: " + id);
        });

        // 3. Now delete the Employee (The Parent)
        employeeRepository.delete(existing);
    }
}