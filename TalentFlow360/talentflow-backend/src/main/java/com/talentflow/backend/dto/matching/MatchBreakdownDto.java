package com.talentflow.backend.dto.matching;

import java.util.ArrayList;
import java.util.List;

public class MatchBreakdownDto {

    private double skillsScore;       // out of 50.0
    private double experienceScore;   // out of 20.0
    private double locationScore;     // out of 15.0
    private double salaryScore;       // out of 15.0
    private double totalScore;        // 0.0 to 100.0
    private String matchTier;         // EXCEPTIONAL_MATCH, STRONG_MATCH, GOOD_MATCH, MODERATE_MATCH, LOW_MATCH

    private List<String> matchedRequiredSkills = new ArrayList<>();
    private List<String> matchedPreferredSkills = new ArrayList<>();
    private List<String> missingRequiredSkills = new ArrayList<>();
    private List<String> missingPreferredSkills = new ArrayList<>();

    private String experienceSummary;
    private String locationSummary;
    private String salarySummary;

    public MatchBreakdownDto() {}

    public MatchBreakdownDto(double skillsScore, double experienceScore, double locationScore,
                             double salaryScore, double totalScore, String matchTier,
                             List<String> matchedRequiredSkills, List<String> matchedPreferredSkills,
                             List<String> missingRequiredSkills, List<String> missingPreferredSkills,
                             String experienceSummary, String locationSummary, String salarySummary) {
        this.skillsScore = skillsScore;
        this.experienceScore = experienceScore;
        this.locationScore = locationScore;
        this.salaryScore = salaryScore;
        this.totalScore = totalScore;
        this.matchTier = matchTier;
        this.matchedRequiredSkills = matchedRequiredSkills != null ? matchedRequiredSkills : new ArrayList<>();
        this.matchedPreferredSkills = matchedPreferredSkills != null ? matchedPreferredSkills : new ArrayList<>();
        this.missingRequiredSkills = missingRequiredSkills != null ? missingRequiredSkills : new ArrayList<>();
        this.missingPreferredSkills = missingPreferredSkills != null ? missingPreferredSkills : new ArrayList<>();
        this.experienceSummary = experienceSummary;
        this.locationSummary = locationSummary;
        this.salarySummary = salarySummary;
    }

    public double getSkillsScore() { return skillsScore; }
    public void setSkillsScore(double skillsScore) { this.skillsScore = skillsScore; }

    public double getExperienceScore() { return experienceScore; }
    public void setExperienceScore(double experienceScore) { this.experienceScore = experienceScore; }

    public double getLocationScore() { return locationScore; }
    public void setLocationScore(double locationScore) { this.locationScore = locationScore; }

    public double getSalaryScore() { return salaryScore; }
    public void setSalaryScore(double salaryScore) { this.salaryScore = salaryScore; }

    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }

    public String getMatchTier() { return matchTier; }
    public void setMatchTier(String matchTier) { this.matchTier = matchTier; }

    public List<String> getMatchedRequiredSkills() { return matchedRequiredSkills; }
    public void setMatchedRequiredSkills(List<String> matchedRequiredSkills) { this.matchedRequiredSkills = matchedRequiredSkills; }

    public List<String> getMatchedPreferredSkills() { return matchedPreferredSkills; }
    public void setMatchedPreferredSkills(List<String> matchedPreferredSkills) { this.matchedPreferredSkills = matchedPreferredSkills; }

    public List<String> getMissingRequiredSkills() { return missingRequiredSkills; }
    public void setMissingRequiredSkills(List<String> missingRequiredSkills) { this.missingRequiredSkills = missingRequiredSkills; }

    public List<String> getMissingPreferredSkills() { return missingPreferredSkills; }
    public void setMissingPreferredSkills(List<String> missingPreferredSkills) { this.missingPreferredSkills = missingPreferredSkills; }

    public String getExperienceSummary() { return experienceSummary; }
    public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }

    public String getLocationSummary() { return locationSummary; }
    public void setLocationSummary(String locationSummary) { this.locationSummary = locationSummary; }

    public String getSalarySummary() { return salarySummary; }
    public void setSalarySummary(String salarySummary) { this.salarySummary = salarySummary; }
}
