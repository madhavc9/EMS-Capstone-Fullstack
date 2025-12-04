package com.capstone.experience.repo;

import com.capstone.experience.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findByEmployeeId(Long employeeId);

    @Query("SELECT e.techStack AS techStack, SUM(e.years) AS totalYears FROM Experience e WHERE e.employeeId = :employeeId GROUP BY e.techStack")
    List<Object[]> findExperienceSummaryByEmployeeId(Long employeeId);
}
