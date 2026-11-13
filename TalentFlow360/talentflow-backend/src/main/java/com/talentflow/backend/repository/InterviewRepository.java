package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Interview;
import com.talentflow.backend.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationIdOrderByScheduledStartTimeDesc(Long applicationId);

    List<Interview> findByCandidateIdOrderByScheduledStartTimeDesc(Long candidateId);

    List<Interview> findByRecruiterIdOrderByScheduledStartTimeDesc(Long recruiterId);

    List<Interview> findByJobIdOrderByScheduledStartTimeDesc(Long jobId);

    List<Interview> findByCandidateIdAndStatusOrderByScheduledStartTimeAsc(Long candidateId, InterviewStatus status);

    long countByRecruiterId(Long recruiterId);

    long countByCandidateId(Long candidateId);

    long countByStatus(InterviewStatus status);
}

