package com.talentflow.backend.repository;

import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateProfile(CandidateProfile candidateProfile);
    List<Resume> findByCandidateProfileId(Long candidateProfileId);
    Optional<Resume> findByCandidateProfileAndIsPrimaryTrue(CandidateProfile candidateProfile);
}

