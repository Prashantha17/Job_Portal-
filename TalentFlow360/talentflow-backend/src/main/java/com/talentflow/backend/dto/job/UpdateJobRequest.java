package com.talentflow.backend.dto.job;

import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.JobStatus;
import com.talentflow.backend.entity.WorkplaceType;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class UpdateJobRequest {

    @Size(max = 200, message = "Job title cannot exceed 200 characters")
    private String title;

    private String description;
    private String requirements;
    private String responsibilities;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    private WorkplaceType workplaceType;
    private EmploymentType employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private Integer experienceYearsMin;
    private Integer experienceYearsMax;
    private Integer vacanciesCount;
    private JobStatus status;
    private Instant expiresAt;

    private List<JobSkillRequest> skills;

    public UpdateJobRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public WorkplaceType getWorkplaceType() { return workplaceType; }
    public void setWorkplaceType(WorkplaceType workplaceType) { this.workplaceType = workplaceType; }

    public EmploymentType getEmploymentType() { return employmentType; }
    public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }

    public Double getMinSalary() { return minSalary; }
    public void setMinSalary(Double minSalary) { this.minSalary = minSalary; }

    public Double getMaxSalary() { return maxSalary; }
    public void setMaxSalary(Double maxSalary) { this.maxSalary = maxSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getExperienceYearsMin() { return experienceYearsMin; }
    public void setExperienceYearsMin(Integer experienceYearsMin) { this.experienceYearsMin = experienceYearsMin; }

    public Integer getExperienceYearsMax() { return experienceYearsMax; }
    public void setExperienceYearsMax(Integer experienceYearsMax) { this.experienceYearsMax = experienceYearsMax; }

    public Integer getVacanciesCount() { return vacanciesCount; }
    public void setVacanciesCount(Integer vacanciesCount) { this.vacanciesCount = vacanciesCount; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public List<JobSkillRequest> getSkills() { return skills; }
    public void setSkills(List<JobSkillRequest> skills) { this.skills = skills; }
}

