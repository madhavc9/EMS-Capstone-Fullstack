package com.capstone.experience.service;

import com.capstone.experience.dto.ExperienceRequest;
import com.capstone.experience.dto.ExperienceResponse;
import com.capstone.experience.dto.ExperienceSummaryResponse;
import com.capstone.experience.exception.NotFoundException;
import com.capstone.experience.model.Experience;
import com.capstone.experience.repo.ExperienceRepository;
import com.capstone.experience.service.impl.ExperienceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperienceServiceImplTest {

    @Mock
    private ExperienceRepository experienceRepository;

    @InjectMocks
    private ExperienceServiceImpl experienceService;

    private Experience testExperience;
    private ExperienceRequest testRequest;

    @BeforeEach
    void setUp() {
        testExperience = new Experience();
        testExperience.setId(1L);
        testExperience.setEmployeeId(10L);
        testExperience.setTechStack("Java");
        testExperience.setCompany("Test Corp");
        testExperience.setYears(5);

        testRequest = new ExperienceRequest();
        testRequest.setEmployeeId(10L);
        testRequest.setTechStack("Java");
        testRequest.setCompany("Test Corp");
        testRequest.setYears(5);
    }

    @Test
    void addExperience_Success() {
        when(experienceRepository.save(any(Experience.class))).thenReturn(testExperience);

        ExperienceResponse response = experienceService.addExperience(10L, testRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Java", response.getTechStack());
        verify(experienceRepository).save(any(Experience.class));
    }

    @Test
    void updateExperience_Success() {
        when(experienceRepository.findById(1L)).thenReturn(Optional.of(testExperience));
        when(experienceRepository.save(testExperience)).thenReturn(testExperience);

        ExperienceResponse response = experienceService.updateExperience(10L, 1L, testRequest);

        assertNotNull(response);
        assertEquals("Java", response.getTechStack());
        verify(experienceRepository).save(testExperience);
    }

    @Test
    void updateExperience_NotFound_ThrowsNotFoundException() {
        when(experienceRepository.findById(999L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> experienceService.updateExperience(10L, 999L, testRequest));

        assertEquals("Experience not found: 999", exception.getMessage());
    }

    @Test
    void updateExperience_WrongEmployeeId_ThrowsNotFoundException() {
        testExperience.setEmployeeId(20L); // Different employee
        when(experienceRepository.findById(1L)).thenReturn(Optional.of(testExperience));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> experienceService.updateExperience(10L, 1L, testRequest));

        assertEquals("Experience does not belong to this employee", exception.getMessage());
    }

    @Test
    void deleteExperience_Success() {
        when(experienceRepository.findById(1L)).thenReturn(Optional.of(testExperience));

        experienceService.deleteExperience(10L, 1L);

        verify(experienceRepository).delete(testExperience);
    }

    @Test
    void deleteExperience_NotFound_ThrowsNotFoundException() {
        when(experienceRepository.findById(999L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> experienceService.deleteExperience(10L, 999L));

        assertEquals("Experience not found: 999", exception.getMessage());
    }

    @Test
    void deleteExperience_WrongEmployeeId_ThrowsNotFoundException() {
        testExperience.setEmployeeId(20L);
        when(experienceRepository.findById(1L)).thenReturn(Optional.of(testExperience));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> experienceService.deleteExperience(10L, 1L));

        assertEquals("Experience does not belong to this employee", exception.getMessage());
    }

    @Test
    void getByEmployee_Success() {
        List<Experience> experiences = Arrays.asList(testExperience);
        when(experienceRepository.findByEmployeeId(10L)).thenReturn(experiences);

        List<ExperienceResponse> responses = experienceService.getByEmployee(10L);

        assertEquals(1, responses.size());
        assertEquals("Java", responses.get(0).getTechStack());
        verify(experienceRepository).findByEmployeeId(10L);
    }

    @Test
    void getExperienceSummary_Success() {
        List<Experience> experiences = Arrays.asList(testExperience);
        when(experienceRepository.findByEmployeeId(10L)).thenReturn(experiences);

        List<ExperienceSummaryResponse> summaries = experienceService.getExperienceSummary(10L);

        assertEquals(1, summaries.size());
        assertEquals("Java", summaries.get(0).getTechStack());
        assertEquals(5, summaries.get(0).getTotalYears());
        verify(experienceRepository).findByEmployeeId(10L);
    }

    @Test
    void getExperienceSummary_MultipleTechStacks() {
        Experience exp2 = new Experience();
        exp2.setId(2L);
        exp2.setEmployeeId(10L);
        exp2.setTechStack("Python");
        exp2.setYears(3);
        List<Experience> experiences = Arrays.asList(testExperience, exp2);
        when(experienceRepository.findByEmployeeId(10L)).thenReturn(experiences);

        List<ExperienceSummaryResponse> summaries = experienceService.getExperienceSummary(10L);

        assertEquals(2, summaries.size());
        assertTrue(summaries.stream().anyMatch(s -> s.getTechStack().equals("Java") && s.getTotalYears() == 5));
        assertTrue(summaries.stream().anyMatch(s -> s.getTechStack().equals("Python") && s.getTotalYears() == 3));
    }

    @Test
    void filter_Success_WithAllParams() {
        Experience exp2 = new Experience();
        exp2.setId(2L);
        exp2.setEmployeeId(10L);
        exp2.setTechStack("Python");
        exp2.setYears(3);
        List<Experience> allExperiences = Arrays.asList(testExperience, exp2);
        when(experienceRepository.findAll(any(Sort.class))).thenReturn(allExperiences);

        List<ExperienceResponse> responses = experienceService.filter(10L, "Java", 4.0, "years", "asc");

        assertEquals(1, responses.size());
        assertEquals("Java", responses.get(0).getTechStack());
        verify(experienceRepository).findAll(any(Sort.class));
    }

    @Test
    void filter_NoParams_ReturnsAll() {
        List<Experience> allExperiences = Arrays.asList(testExperience);
        when(experienceRepository.findAll(any(Sort.class))).thenReturn(allExperiences);

        List<ExperienceResponse> responses = experienceService.filter(null, null, null, "id", "asc");

        assertEquals(1, responses.size());
        verify(experienceRepository).findAll(any(Sort.class));
    }

    @Test
    void getAllExperience_Success() {
        List<Experience> experiences = Arrays.asList(testExperience);
        when(experienceRepository.findAll()).thenReturn(experiences);

        List<ExperienceResponse> responses = experienceService.getAllExperience();

        assertEquals(1, responses.size());
        assertEquals("Java", responses.get(0).getTechStack());
        verify(experienceRepository).findAll();
    }
}