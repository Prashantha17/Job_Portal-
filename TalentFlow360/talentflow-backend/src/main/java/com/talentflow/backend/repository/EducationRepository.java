package com.talentflow.backend.repository;

import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByCandidateProfile(CandidateProfile candidateProfile);
    List<Education> findByCandidateProfileId(Long candidateProfileId);
}

