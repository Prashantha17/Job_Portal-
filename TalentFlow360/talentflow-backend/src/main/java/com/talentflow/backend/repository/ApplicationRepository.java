package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateProfileUserEmailOrderByAppliedAtDesc(String email);
    Page<Application> findByJobIdOrderByAppliedAtDesc(Long jobId, Pageable pageable);
    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);
    boolean existsByJobIdAndCandidateProfileUserEmail(Long jobId, String email);
    Optional<Application> findByJobIdAndCandidateProfileUserEmail(Long jobId, String email);
}

