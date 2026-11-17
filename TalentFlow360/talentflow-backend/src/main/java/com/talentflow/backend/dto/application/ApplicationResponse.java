package com.talentflow.backend.dto.application;

import com.talentflow.backend.entity.ApplicationStatus;
import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.WorkplaceType;

import java.time.Instant;

public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String location;
    private WorkplaceType workplaceType;
    private EmploymentType employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private ApplicationStatus status;
    private Long candidateProfileId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private Double currentCtcLpa;
    private Double expectedCtcLpa;
    private String coverLetter;
    private Long resumeId;
    private String resumeTitle;
    private String resumeUrl;
    private String rejectionReason;
    private Double atsScore;
    private String atsMatchTier;
    private Instant appliedAt;
    private Instant updatedAt;

    public ApplicationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

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

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Long getCandidateProfileId() { return candidateProfileId; }
    public void setCandidateProfileId(Long candidateProfileId) { this.candidateProfileId = candidateProfileId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidatePhone() { return candidatePhone; }
    public void setCandidatePhone(String candidatePhone) { this.candidatePhone = candidatePhone; }

    public Double getCurrentCtcLpa() { return currentCtcLpa; }
    public void setCurrentCtcLpa(Double currentCtcLpa) { this.currentCtcLpa = currentCtcLpa; }

    public Double getExpectedCtcLpa() { return expectedCtcLpa; }
    public void setExpectedCtcLpa(Double expectedCtcLpa) { this.expectedCtcLpa = expectedCtcLpa; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public String getResumeTitle() { return resumeTitle; }
    public void setResumeTitle(String resumeTitle) { this.resumeTitle = resumeTitle; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Double getAtsScore() { return atsScore; }
    public void setAtsScore(Double atsScore) { this.atsScore = atsScore; }

    public String getAtsMatchTier() { return atsMatchTier; }
    public void setAtsMatchTier(String atsMatchTier) { this.atsMatchTier = atsMatchTier; }

    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

