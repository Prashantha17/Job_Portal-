package com.talentflow.backend.dto.job;

import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.JobStatus;
import com.talentflow.backend.entity.WorkplaceType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class JobResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyIndustry;
    private String companyWebsite;
    private boolean isCompanyVerified;

    private Long postedById;
    private String postedByName;
    private String postedByEmail;

    private String title;
    private String description;
    private String requirements;
    private String responsibilities;
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
    private Integer viewsCount;
    private Integer applicationsCount;

    private List<JobSkillDTO> skills = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    public JobResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }

    public String getCompanyIndustry() { return companyIndustry; }
    public void setCompanyIndustry(String companyIndustry) { this.companyIndustry = companyIndustry; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public boolean isCompanyVerified() { return isCompanyVerified; }
    public void setCompanyVerified(boolean companyVerified) { isCompanyVerified = companyVerified; }

    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }

    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }

    public String getPostedByEmail() { return postedByEmail; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }

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

    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }

    public Integer getApplicationsCount() { return applicationsCount; }
    public void setApplicationsCount(Integer applicationsCount) { this.applicationsCount = applicationsCount; }

    public List<JobSkillDTO> getSkills() { return skills; }
    public void setSkills(List<JobSkillDTO> skills) { this.skills = skills; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

