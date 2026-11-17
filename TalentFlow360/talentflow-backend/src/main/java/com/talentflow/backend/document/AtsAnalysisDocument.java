package com.talentflow.backend.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "ats_analyses")
public class AtsAnalysisDocument {

    @Id
    private String id;

    @Indexed
    private Long applicationId;

    @Indexed
    private Long jobId;

    private String jobTitle;

    @Indexed
    private String candidateEmail;

    private String resumeFileName;

    private double atsScore; // 0.0 - 100.0
    private String matchTier; // EXCELLENT_MATCH, STRONG_MATCH, GOOD_MATCH, MODERATE_MATCH, LOW_MATCH

    private double skillsScore; // out of 40.0
    private double experienceScore; // out of 30.0
    private double keywordScore; // out of 20.0
    private double formatScore; // out of 10.0

    private List<String> matchedKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();
    private List<String> topStrengths = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
    private List<String> mistakes = new ArrayList<>();
    private List<String> improvements = new ArrayList<>();

    // Pin-to-pin deep extraction metrics
    private int wordCount;
    private String candidateNameExtracted;
    private String detectedDegree;
    private int detectedYearsExp;
    private String contactSummary;
    private List<String> detectedSections = new ArrayList<>();
    private List<String> bulletAudits = new ArrayList<>();

    private String summary;
    private Instant analyzedAt = Instant.now();

    public AtsAnalysisDocument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public double getAtsScore() { return atsScore; }
    public void setAtsScore(double atsScore) { this.atsScore = atsScore; }

    public String getMatchTier() { return matchTier; }
    public void setMatchTier(String matchTier) { this.matchTier = matchTier; }

    public double getSkillsScore() { return skillsScore; }
    public void setSkillsScore(double skillsScore) { this.skillsScore = skillsScore; }

    public double getExperienceScore() { return experienceScore; }
    public void setExperienceScore(double experienceScore) { this.experienceScore = experienceScore; }

    public double getKeywordScore() { return keywordScore; }
    public void setKeywordScore(double keywordScore) { this.keywordScore = keywordScore; }

    public double getFormatScore() { return formatScore; }
    public void setFormatScore(double formatScore) { this.formatScore = formatScore; }

    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public void setMatchedKeywords(List<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getTopStrengths() { return topStrengths; }
    public void setTopStrengths(List<String> topStrengths) { this.topStrengths = topStrengths; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public List<String> getMistakes() { return mistakes; }
    public void setMistakes(List<String> mistakes) { this.mistakes = mistakes; }

    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }

    public int getWordCount() { return wordCount; }
    public void setWordCount(int wordCount) { this.wordCount = wordCount; }

    public String getCandidateNameExtracted() { return candidateNameExtracted; }
    public void setCandidateNameExtracted(String candidateNameExtracted) { this.candidateNameExtracted = candidateNameExtracted; }

    public String getDetectedDegree() { return detectedDegree; }
    public void setDetectedDegree(String detectedDegree) { this.detectedDegree = detectedDegree; }

    public int getDetectedYearsExp() { return detectedYearsExp; }
    public void setDetectedYearsExp(int detectedYearsExp) { this.detectedYearsExp = detectedYearsExp; }

    public String getContactSummary() { return contactSummary; }
    public void setContactSummary(String contactSummary) { this.contactSummary = contactSummary; }

    public List<String> getDetectedSections() { return detectedSections; }
    public void setDetectedSections(List<String> detectedSections) { this.detectedSections = detectedSections; }

    public List<String> getBulletAudits() { return bulletAudits; }
    public void setBulletAudits(List<String> bulletAudits) { this.bulletAudits = bulletAudits; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }
}
