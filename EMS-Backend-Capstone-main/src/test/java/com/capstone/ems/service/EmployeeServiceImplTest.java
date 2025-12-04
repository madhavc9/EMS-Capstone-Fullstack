package com.capstone.ems.service;

import com.capstone.ems.dto.EmployeeDto;
import com.capstone.ems.exception.BadRequestException;
import com.capstone.ems.exception.NotFoundException;
import com.capstone.ems.model.Employee;
import com.capstone.ems.model.UserEntity;
import com.capstone.ems.repo.EmployeeRepository;
import com.capstone.ems.repo.UserRepository;
import com.capstone.ems.service.EmailService;
import com.capstone.ems.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;

    @InjectMocks private EmployeeServiceImpl employeeServiceImpl;

    private Employee testEmployee;
    private EmployeeDto testDto;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setName("Test Employee");
        testEmployee.setEmail("test@ems.com");
        testEmployee.setDesignation("Developer");
        testEmployee.setSalary(new BigDecimal("50000"));
        testEmployee.setBirthDate(LocalDate.of(1990, 1, 1));

        testDto = new EmployeeDto();
        testDto.setName("Test Employee");
        testDto.setEmail("test@ems.com");
        testDto.setDesignation("Developer");
        testDto.setSalary(new BigDecimal("50000"));
        testDto.setBirthDate(LocalDate.of(1990, 1, 1));
        testDto.setRole("USER");
    }

    @Test
    void getAllEmployees_Success() {
        List<Employee> employees = Arrays.asList(testEmployee);
        when(employeeRepository.findAll()).thenReturn(employees);

        List<EmployeeDto> result = employeeServiceImpl.getAllEmployees();

        assertEquals(1, result.size());
        assertEquals("Test Employee", result.get(0).getName());
        verify(employeeRepository).findAll();
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));

        EmployeeDto result = employeeServiceImpl.getEmployeeById(1L);

        assertEquals("Test Employee", result.getName());
        verify(employeeRepository).findById(1L);
    }

    @Test
    void getEmployeeById_NotFound_ThrowsNotFoundException() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> employeeServiceImpl.getEmployeeById(999L));
        assertEquals("Employee not found with id: 999", exception.getMessage());
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any(UserEntity.class))).thenReturn(new UserEntity());

        EmployeeDto result = employeeServiceImpl.createEmployee(testDto);

        assertEquals(1L, result.getId());
        verify(employeeRepository).save(any(Employee.class));
        verify(userRepository).save(any(UserEntity.class));
        verify(emailService).sendWelcomeEmail(eq("test@ems.com"), eq("Test Employee"), eq("test"), eq("test$$01"));
    }

    @Test
    void updateEmployee_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.existsByEmail("test@ems.com")).thenReturn(false);
        when(employeeRepository.save(testEmployee)).thenReturn(testEmployee);

        EmployeeDto result = employeeServiceImpl.updateEmployee(1L, testDto);

        assertEquals("Test Employee", result.getName());
        verify(employeeRepository, times(1)).save(testEmployee);
    }

    @Test
    void updateEmployee_EmailInUse_ThrowsBadRequest() {
        testDto.setEmail("other@ems.com");
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.existsByEmail("other@ems.com")).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> employeeServiceImpl.updateEmployee(1L, testDto));
        assertEquals("Email already in use: other@ems.com", exception.getMessage());
    }

    @Test
    void updateEmployee_NotFound_ThrowsNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> employeeServiceImpl.updateEmployee(999L, testDto));
        assertEquals("Employee not found with id: 999", exception.getMessage());
    }

    @Test
    void deleteEmployee_Success_WithUser() {
        UserEntity associatedUser = new UserEntity();
        associatedUser.setId(1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByEmployeeId(1L)).thenReturn(Optional.of(associatedUser));

        employeeServiceImpl.deleteEmployee(1L);

        verify(userRepository).delete(associatedUser);
        verify(employeeRepository).delete(testEmployee);
    }

    @Test
    void deleteEmployee_Success_NoUser() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByEmployeeId(1L)).thenReturn(Optional.empty());

        employeeServiceImpl.deleteEmployee(1L);

        verifyNoInteractions(userRepository);
        verify(employeeRepository).delete(testEmployee);
    }

    @Test
    void deleteEmployee_NotFound_ThrowsNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> employeeServiceImpl.deleteEmployee(999L));
        assertEquals("Employee not found with id: 999", exception.getMessage());
    }
}