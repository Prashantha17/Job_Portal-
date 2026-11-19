package com.talentflow.backend.dto.application;

import java.util.ArrayList;
import java.util.List;

public class ConstructiveFeedbackResponse {

    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String candidateName;
    private String applicationStatus;
    private double atsScore;
    private String matchTier;
    private String constructiveSummary;
    private List<String> identifiedStrengths = new ArrayList<>();
    private List<String> criticalSkillGaps = new ArrayList<>();
    private List<String> recommendedActionPlan = new ArrayList<>();
    private List<String> resumeOptimizationTips = new ArrayList<>();
    private String encouragementNote;

    public ConstructiveFeedbackResponse() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }

    public double getAtsScore() { return atsScore; }
    public void setAtsScore(double atsScore) { this.atsScore = atsScore; }

    public String getMatchTier() { return matchTier; }
    public void setMatchTier(String matchTier) { this.matchTier = matchTier; }

    public String getConstructiveSummary() { return constructiveSummary; }
    public void setConstructiveSummary(String constructiveSummary) { this.constructiveSummary = constructiveSummary; }

    public List<String> getIdentifiedStrengths() { return identifiedStrengths; }
    public void setIdentifiedStrengths(List<String> identifiedStrengths) { this.identifiedStrengths = identifiedStrengths; }

    public List<String> getCriticalSkillGaps() { return criticalSkillGaps; }
    public void setCriticalSkillGaps(List<String> criticalSkillGaps) { this.criticalSkillGaps = criticalSkillGaps; }

    public List<String> getRecommendedActionPlan() { return recommendedActionPlan; }
    public void setRecommendedActionPlan(List<String> recommendedActionPlan) { this.recommendedActionPlan = recommendedActionPlan; }

    public List<String> getResumeOptimizationTips() { return resumeOptimizationTips; }
    public void setResumeOptimizationTips(List<String> resumeOptimizationTips) { this.resumeOptimizationTips = resumeOptimizationTips; }

    public String getEncouragementNote() { return encouragementNote; }
    public void setEncouragementNote(String encouragementNote) { this.encouragementNote = encouragementNote; }
}
