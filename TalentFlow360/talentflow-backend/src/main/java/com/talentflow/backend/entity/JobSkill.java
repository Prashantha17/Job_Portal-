package com.talentflow.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job_skills", indexes = {
        @Index(name = "idx_job_skill_job", columnList = "job_id"),
        @Index(name = "idx_job_skill_skill", columnList = "skill_id")
})
public class JobSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "requirement_level", nullable = false, length = 20)
    private SkillRequirementLevel requirementLevel = SkillRequirementLevel.REQUIRED;

    @Column(name = "min_years_experience")
    private Double minYearsExperience = 1.0;

    public JobSkill() {}

    public JobSkill(Job job, Skill skill, SkillRequirementLevel requirementLevel, Double minYearsExperience) {
        this.job = job;
        this.skill = skill;
        this.requirementLevel = requirementLevel != null ? requirementLevel : SkillRequirementLevel.REQUIRED;
        this.minYearsExperience = minYearsExperience != null ? minYearsExperience : 1.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public SkillRequirementLevel getRequirementLevel() { return requirementLevel; }
    public void setRequirementLevel(SkillRequirementLevel requirementLevel) { this.requirementLevel = requirementLevel; }

    public Double getMinYearsExperience() { return minYearsExperience; }
    public void setMinYearsExperience(Double minYearsExperience) { this.minYearsExperience = minYearsExperience; }
}

