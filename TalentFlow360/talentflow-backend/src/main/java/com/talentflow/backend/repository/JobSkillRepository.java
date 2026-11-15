package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    List<JobSkill> findByJob(Job job);
    void deleteByJob(Job job);

    @Query("SELECT js FROM JobSkill js WHERE js.job.postedBy.id = :recruiterId")
    List<JobSkill> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    @Query("SELECT js.skill.name, COUNT(js) FROM JobSkill js WHERE js.job.postedBy.id = :recruiterId GROUP BY js.skill.name ORDER BY COUNT(js) DESC")
    List<Object[]> countSkillDemandForRecruiter(@Param("recruiterId") Long recruiterId);
}


