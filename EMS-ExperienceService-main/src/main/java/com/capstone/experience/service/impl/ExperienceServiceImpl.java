package com.capstone.experience.service.impl;

import com.capstone.experience.dto.ExperienceRequest;
import com.capstone.experience.dto.ExperienceResponse;
import com.capstone.experience.dto.ExperienceSummaryResponse;
import com.capstone.experience.exception.NotFoundException;
import com.capstone.experience.model.Experience;
import com.capstone.experience.repo.ExperienceRepository;
import com.capstone.experience.service.ExperienceService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExperienceServiceImpl implements ExperienceService {

    private final ExperienceRepository experienceRepository;

    public ExperienceServiceImpl(ExperienceRepository experienceRepository) {
        this.experienceRepository = experienceRepository;
    }

    private ExperienceResponse toResponse(Experience exp) {
        return new ExperienceResponse(
                exp.getId(),
                exp.getEmployeeId(),
                exp.getTechStack(),
                exp.getCompany(),
                exp.getYears()
        );
    }

    @Override
    public ExperienceResponse addExperience(Long employeeId, ExperienceRequest request) {
        Experience exp = new Experience();
        exp.setEmployeeId(employeeId);
        exp.setTechStack(request.getTechStack());
        exp.setCompany(request.getCompany());
        exp.setYears(request.getYears());

        Experience saved = experienceRepository.save(exp);
        return toResponse(saved);
    }

    @Override
    public ExperienceResponse updateExperience(Long employeeId, Long experienceId, ExperienceRequest request) {
        Experience existing = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new NotFoundException("Experience not found: " + experienceId));

        if (!existing.getEmployeeId().equals(employeeId)) {
            throw new NotFoundException("Experience does not belong to this employee");
        }

        existing.setTechStack(request.getTechStack());
        existing.setCompany(request.getCompany());
        existing.setYears(request.getYears());

        Experience updated = experienceRepository.save(existing);
        return toResponse(updated);
    }

    @Override
    public void deleteExperience(Long employeeId, Long experienceId) {
        Experience existing = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new NotFoundException("Experience not found: " + experienceId));

        if (!existing.getEmployeeId().equals(employeeId)) {
            throw new NotFoundException("Experience does not belong to this employee");
        }

        experienceRepository.delete(existing);
    }

    @Override
    public List<ExperienceResponse> getByEmployee(Long employeeId) {
        return experienceRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExperienceSummaryResponse> getExperienceSummary(Long employeeId) {
        return experienceRepository.findByEmployeeId(employeeId)
                .stream()
                .collect(Collectors.groupingBy(
                        Experience::getTechStack,
                        Collectors.summingInt(Experience::getYears)
                ))
                .entrySet()
                .stream()
                .map(e -> new ExperienceSummaryResponse(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    @Override
    public List<ExperienceResponse> filter(Long employeeId,
                                           String techStack,
                                           Double minYears,
                                           String sortBy,
                                           String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        List<Experience> experiences = experienceRepository.findAll(sort);

        return experiences.stream()
                .filter(exp -> employeeId == null || exp.getEmployeeId().equals(employeeId))
                .filter(exp -> techStack == null || exp.getTechStack().equalsIgnoreCase(techStack))
                .filter(exp -> minYears == null || exp.getYears() >= minYears)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    
    @Override
    public List<ExperienceResponse> getAllExperience() {
        return experienceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

}
