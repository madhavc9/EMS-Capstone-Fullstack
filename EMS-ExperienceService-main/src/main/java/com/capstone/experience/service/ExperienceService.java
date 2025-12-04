package com.capstone.experience.service;

import com.capstone.experience.dto.ExperienceRequest;
import com.capstone.experience.dto.ExperienceResponse;
import com.capstone.experience.dto.ExperienceSummaryResponse;

import java.util.List;

public interface ExperienceService {

    ExperienceResponse addExperience(Long employeeId, ExperienceRequest request);

    ExperienceResponse updateExperience(Long employeeId, Long experienceId, ExperienceRequest request);

    void deleteExperience(Long employeeId, Long experienceId);

    List<ExperienceResponse> getByEmployee(Long employeeId);

    List<ExperienceSummaryResponse> getExperienceSummary(Long employeeId);

    List<ExperienceResponse> filter(Long employeeId,
                                    String techStack,
                                    Double minYears,
                                    String sortBy,
                                    String sortDir);
    
    List<ExperienceResponse> getAllExperience();

}
