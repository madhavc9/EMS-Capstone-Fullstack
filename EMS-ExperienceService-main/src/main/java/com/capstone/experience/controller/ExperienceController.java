package com.capstone.experience.controller;

import com.capstone.experience.dto.ExperienceRequest;
import com.capstone.experience.dto.ExperienceResponse;
import com.capstone.experience.dto.ExperienceSummaryResponse;
import com.capstone.experience.security.JwtUtil;
import com.capstone.experience.service.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/experience")
//@CrossOrigin(origins = "*")
public class ExperienceController {

    private final ExperienceService experienceService;
    private final JwtUtil jwtUtil;

    public ExperienceController(ExperienceService experienceService, JwtUtil jwtUtil) {
        this.experienceService = experienceService;
        this.jwtUtil = jwtUtil;
    }

    private Long getEmployeeIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractEmployeeId(token);
    }

    // -------------------- USER / ADMIN : View own experience --------------------

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/me")
    public ResponseEntity<List<ExperienceResponse>> getMyExperience(
            @RequestHeader("Authorization") String authHeader) {

        Long employeeId = getEmployeeIdFromToken(authHeader);
        List<ExperienceResponse> list = experienceService.getByEmployee(employeeId);
        return ResponseEntity.ok(list);
    }

    // Chart data for logged-in user
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/summary/me")
    public ResponseEntity<List<ExperienceSummaryResponse>> getMySummary(
            @RequestHeader("Authorization") String authHeader) {

        Long employeeId = getEmployeeIdFromToken(authHeader);
        List<ExperienceSummaryResponse> summary = experienceService.getExperienceSummary(employeeId);
        return ResponseEntity.ok(summary);
    }

    // -------------------- ADMIN: View specific employee's experience --------------------

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ExperienceResponse>> getByEmployee(
            @PathVariable Long employeeId) {

        List<ExperienceResponse> list = experienceService.getByEmployee(employeeId);
        return ResponseEntity.ok(list);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/employee/summary/{employeeId}")
    public ResponseEntity<List<ExperienceSummaryResponse>> getSummaryForEmployee(
            @PathVariable Long employeeId) {

        List<ExperienceSummaryResponse> summary = experienceService.getExperienceSummary(employeeId);
        return ResponseEntity.ok(summary);
    }

    // -------------------- ADMIN: Create / Update / Delete --------------------

    // Admin creates experience for any employee (employeeId inside request)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ExperienceResponse> create(@Valid @RequestBody ExperienceRequest request) {
        ExperienceResponse res = experienceService.addExperience(request.getEmployeeId(), request);
        return ResponseEntity.ok(res);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ExperienceResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody ExperienceRequest request) {
        ExperienceResponse res = experienceService.updateExperience(request.getEmployeeId(), id, request);
        return ResponseEntity.ok(res);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestParam Long employeeId) {
        experienceService.deleteExperience(employeeId, id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- FILTER / SORT (for dashboard) --------------------

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/filter")
    public ResponseEntity<List<ExperienceResponse>> filter(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String techStack,
            @RequestParam(required = false) Integer minYears,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        List<ExperienceResponse> list =
                experienceService.filter(
                        employeeId,
                        techStack,
                        minYears != null ? minYears.doubleValue() : null,
                        sortBy,
                        sortDir
                );
        return ResponseEntity.ok(list);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ExperienceResponse>> getAll() {
        List<ExperienceResponse> list = experienceService.getAllExperience();
        return ResponseEntity.ok(list);
    }

}
