package com.talentflow.backend.dto.matching;

import com.talentflow.backend.entity.ApplicationStatus;

import java.util.List;

public class CandidateMatchDto {

    private Long candidateId;
    private String candidateName;
    private String email;
    private String phone;
    private String headline;
    private String location;
    private Double totalExperienceYears;
    private Double currentSalary;
    private Double expectedSalary;
    private List<String> skills;

    private double matchScore;
    private String matchTier;
    private MatchBreakdownDto breakdown;

    private boolean hasApplied;
    private Long applicationId;
    private ApplicationStatus applicationStatus;

    public CandidateMatchDto() {}

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getTotalExperienceYears() { return totalExperienceYears; }
    public void setTotalExperienceYears(Double totalExperienceYears) { this.totalExperienceYears = totalExperienceYears; }

    public Double getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(Double currentSalary) { this.currentSalary = currentSalary; }

    public Double getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Double expectedSalary) { this.expectedSalary = expectedSalary; }

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
