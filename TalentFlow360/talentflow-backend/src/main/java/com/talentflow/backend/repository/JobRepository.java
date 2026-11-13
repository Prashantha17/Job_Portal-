package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Company;
import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.JobStatus;
import com.talentflow.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    Page<Job> findByCompany(Company company, Pageable pageable);
    Page<Job> findByPostedBy(User postedBy, Pageable pageable);
    List<Job> findByPostedByOrderByCreatedAtDesc(User postedBy);

    long countByStatus(JobStatus status);

    @Query("SELECT j FROM Job j JOIN FETCH j.company LEFT JOIN FETCH j.jobSkills js LEFT JOIN FETCH js.skill WHERE j.id = :id")
    java.util.Optional<Job> findByIdWithDetails(@Param("id") Long id);
}

