package com.talentflow.backend.dto.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SendOfferLetterRequest {

    @NotBlank(message = "Candidate name is required")
    private String candidateName;

    private String candidateEmail;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotNull(message = "Offered Annual CTC (in LPA) is required")
    @Positive(message = "Annual CTC must be greater than zero")
    private Double annualCtcLpa;

    @NotBlank(message = "Joining date is required")
    private String joiningDate;

    private String jobLocation;

    private String reportingManager;

    private String acceptanceDeadline;

    private String customRemarks;

    private String signeeName;

    private String signeeTitle;

    /**
     * If true, updates application status directly to HIRED.
     * If false, updates status to OFFER_RELEASED.
     */
    private boolean markAsHired;

    public SendOfferLetterRequest() {}

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Double getAnnualCtcLpa() { return annualCtcLpa; }
    public void setAnnualCtcLpa(Double annualCtcLpa) { this.annualCtcLpa = annualCtcLpa; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public String getReportingManager() { return reportingManager; }
    public void setReportingManager(String reportingManager) { this.reportingManager = reportingManager; }

    public String getAcceptanceDeadline() { return acceptanceDeadline; }
    public void setAcceptanceDeadline(String acceptanceDeadline) { this.acceptanceDeadline = acceptanceDeadline; }

    public String getCustomRemarks() { return customRemarks; }
    public void setCustomRemarks(String customRemarks) { this.customRemarks = customRemarks; }

    public String getSigneeName() { return signeeName; }
    public void setSigneeName(String signeeName) { this.signeeName = signeeName; }

    public String getSigneeTitle() { return signeeTitle; }
    public void setSigneeTitle(String signeeTitle) { this.signeeTitle = signeeTitle; }

    public boolean isMarkAsHired() { return markAsHired; }
    public void setMarkAsHired(boolean markAsHired) { this.markAsHired = markAsHired; }
}
