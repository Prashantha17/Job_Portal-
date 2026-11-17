package com.talentflow.backend.dto.matching;

import com.talentflow.backend.entity.ApplicationStatus;
import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.WorkplaceType;

import java.time.Instant;
import java.util.List;

public class JobRecommendationDto {

    private Long jobId;
    private String title;
    private String companyName;
    private String companyLogoUrl;
    private String location;
    private WorkplaceType workplaceType;
    private EmploymentType employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private Integer experienceYearsMin;
    private Integer vacanciesCount;
    private Instant createdAt;
    private List<String> skills;

    private double matchScore;
    private String matchTier;
    private MatchBreakdownDto breakdown;

    private boolean hasApplied;
    private Long applicationId;
    private ApplicationStatus applicationStatus;

    public JobRecommendationDto() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }

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

    public Integer getVacanciesCount() { return vacanciesCount; }
    public void setVacanciesCount(Integer vacanciesCount) { this.vacanciesCount = vacanciesCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getMatchTier() { return matchTier; }
    public void setMatchTier(String matchTier) { this.matchTier = matchTier; }

    public MatchBreakdownDto getBreakdown() { return breakdown; }
    public void setBreakdown(MatchBreakdownDto breakdown) { this.breakdown = breakdown; }

    public boolean isHasApplied() { return hasApplied; }
    public void setHasApplied(boolean hasApplied) { this.hasApplied = hasApplied; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public ApplicationStatus getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(ApplicationStatus applicationStatus) { this.applicationStatus = applicationStatus; }
}
