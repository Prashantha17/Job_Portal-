package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    List<JobSkill> findByJob(Job job);
    void deleteByJob(Job job);
}

