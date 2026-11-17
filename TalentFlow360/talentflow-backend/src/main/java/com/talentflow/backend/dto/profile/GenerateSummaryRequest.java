package com.talentflow.backend.dto.profile;

public class GenerateSummaryRequest {
    private String tone; // "BALANCED", "RESULTS_DRIVEN", "TECHNICAL", "LEADERSHIP"
    private String customInstruction;
    private Boolean includeResumeKeywords;

    public GenerateSummaryRequest() {}

    public GenerateSummaryRequest(String tone, String customInstruction, Boolean includeResumeKeywords) {
        this.tone = tone;
        this.customInstruction = customInstruction;
        this.includeResumeKeywords = includeResumeKeywords;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getCustomInstruction() {
        return customInstruction;
    }

    public void setCustomInstruction(String customInstruction) {
        this.customInstruction = customInstruction;
    }

    public Boolean getIncludeResumeKeywords() {
        return includeResumeKeywords;
    }

    public void setIncludeResumeKeywords(Boolean includeResumeKeywords) {
        this.includeResumeKeywords = includeResumeKeywords;
    }
}
