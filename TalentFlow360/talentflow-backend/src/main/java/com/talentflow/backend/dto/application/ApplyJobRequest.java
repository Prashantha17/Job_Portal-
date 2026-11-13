package com.talentflow.backend.dto.application;

import jakarta.validation.constraints.NotNull;

public class ApplyJobRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    private Long resumeId;
    private String coverLetter;
    private String candidateName;
    private String candidatePhone;
    private Double currentCtcLpa;
    private Double expectedCtcLpa;

    public ApplyJobRequest() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidatePhone() { return candidatePhone; }
    public void setCandidatePhone(String candidatePhone) { this.candidatePhone = candidatePhone; }

    public Double getCurrentCtcLpa() { return currentCtcLpa; }
    public void setCurrentCtcLpa(Double currentCtcLpa) { this.currentCtcLpa = currentCtcLpa; }

    public Double getExpectedCtcLpa() { return expectedCtcLpa; }
    public void setExpectedCtcLpa(Double expectedCtcLpa) { this.expectedCtcLpa = expectedCtcLpa; }
}

