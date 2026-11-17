package com.talentflow.backend.dto.profile;

import java.util.List;

public class GenerateSummaryResponse {
    private String summary;
    private String tone;
    private int skillsCount;
    private int experiencesCount;
    private int educationsCount;
    private boolean resumeFound;
    private String resumeFileName;
    private List<String> highlightedSkills;
    private List<String> detectedMetrics;

    public GenerateSummaryResponse() {}

    public GenerateSummaryResponse(String summary, String tone, int skillsCount, int experiencesCount,
                                   int educationsCount, boolean resumeFound, String resumeFileName,
                                   List<String> highlightedSkills, List<String> detectedMetrics) {
        this.summary = summary;
        this.tone = tone;
        this.skillsCount = skillsCount;
        this.experiencesCount = experiencesCount;
        this.educationsCount = educationsCount;
        this.resumeFound = resumeFound;
        this.resumeFileName = resumeFileName;
        this.highlightedSkills = highlightedSkills;
        this.detectedMetrics = detectedMetrics;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public int getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(int skillsCount) {
        this.skillsCount = skillsCount;
    }

    public int getExperiencesCount() {
        return experiencesCount;
    }

    public void setExperiencesCount(int experiencesCount) {
        this.experiencesCount = experiencesCount;
    }

    public int getEducationsCount() {
        return educationsCount;
    }

    public void setEducationsCount(int educationsCount) {
        this.educationsCount = educationsCount;
    }

    public boolean isResumeFound() {
        return resumeFound;
    }

    public void setResumeFound(boolean resumeFound) {
        this.resumeFound = resumeFound;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public List<String> getHighlightedSkills() {
        return highlightedSkills;
    }

    public void setHighlightedSkills(List<String> highlightedSkills) {
        this.highlightedSkills = highlightedSkills;
    }

    public List<String> getDetectedMetrics() {
        return detectedMetrics;
    }

    public void setDetectedMetrics(List<String> detectedMetrics) {
        this.detectedMetrics = detectedMetrics;
    }
}
