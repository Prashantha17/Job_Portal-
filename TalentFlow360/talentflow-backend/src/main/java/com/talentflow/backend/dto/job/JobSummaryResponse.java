package com.talentflow.backend.dto.job;

import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.JobStatus;
import com.talentflow.backend.entity.WorkplaceType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class JobSummaryResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private boolean isCompanyVerified;

    private String title;
    private String location;
    private WorkplaceType workplaceType;
    private EmploymentType employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private Integer experienceYearsMin;
    private JobStatus status;
    private Integer applicationsCount;

    private List<String> topSkills = new ArrayList<>();
    private Instant createdAt;

    public JobSummaryResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }

    public boolean isCompanyVerified() { return isCompanyVerified; }
    public void setCompanyVerified(boolean companyVerified) { isCompanyVerified = companyVerified; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

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

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public Integer getApplicationsCount() { return applicationsCount; }
    public void setApplicationsCount(Integer applicationsCount) { this.applicationsCount = applicationsCount; }

    public List<String> getTopSkills() { return topSkills; }
    public void setTopSkills(List<String> topSkills) { this.topSkills = topSkills; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

