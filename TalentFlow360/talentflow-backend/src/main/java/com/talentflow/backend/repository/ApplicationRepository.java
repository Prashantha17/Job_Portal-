package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    List<Application> findByResumeId(Long resumeId);

    @Query("SELECT a FROM Application a WHERE a.job.postedBy.id = :recruiterId ORDER BY a.appliedAt DESC")
    List<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    @Query("SELECT a FROM Application a WHERE a.job.postedBy.email = :email ORDER BY a.appliedAt DESC")
    List<Application> findByRecruiterEmail(@Param("email") String email);

    @Query("SELECT a FROM Application a WHERE a.job.id IN :jobIds ORDER BY a.appliedAt DESC")
    List<Application> findByJobIdIn(@Param("jobIds") List<Long> jobIds);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.job.postedBy.id = :recruiterId GROUP BY a.status")
    List<Object[]> countByStatusForRecruiter(@Param("recruiterId") Long recruiterId);
}


