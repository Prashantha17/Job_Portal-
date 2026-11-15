package com.talentflow.backend.dto.analytics;

public class RecruiterOverviewDto {

    private long totalJobs;
    private long activeJobs;
    private long totalVacancies;
    private long totalApplications;
    private double avgTimeToHireDays;
    private double offerAcceptanceRate;
    private double shortlistRate;
    private double interviewPassRate;
    private long activeCandidatesInPipeline;
    private long hiredCount;
    private long rejectedCount;

    public RecruiterOverviewDto() {}

    public RecruiterOverviewDto(long totalJobs, long activeJobs, long totalVacancies,
                                long totalApplications, double avgTimeToHireDays,
                                double offerAcceptanceRate, double shortlistRate,
                                double interviewPassRate, long activeCandidatesInPipeline,
                                long hiredCount, long rejectedCount) {
        this.totalJobs = totalJobs;
        this.activeJobs = activeJobs;
        this.totalVacancies = totalVacancies;
        this.totalApplications = totalApplications;
        this.avgTimeToHireDays = avgTimeToHireDays;
        this.offerAcceptanceRate = offerAcceptanceRate;
        this.shortlistRate = shortlistRate;
        this.interviewPassRate = interviewPassRate;
        this.activeCandidatesInPipeline = activeCandidatesInPipeline;
        this.hiredCount = hiredCount;
        this.rejectedCount = rejectedCount;
    }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getTotalVacancies() { return totalVacancies; }
    public void setTotalVacancies(long totalVacancies) { this.totalVacancies = totalVacancies; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public double getAvgTimeToHireDays() { return avgTimeToHireDays; }
    public void setAvgTimeToHireDays(double avgTimeToHireDays) { this.avgTimeToHireDays = avgTimeToHireDays; }

    public double getOfferAcceptanceRate() { return offerAcceptanceRate; }
    public void setOfferAcceptanceRate(double offerAcceptanceRate) { this.offerAcceptanceRate = offerAcceptanceRate; }

    public double getShortlistRate() { return shortlistRate; }
    public void setShortlistRate(double shortlistRate) { this.shortlistRate = shortlistRate; }

    public double getInterviewPassRate() { return interviewPassRate; }
    public void setInterviewPassRate(double interviewPassRate) { this.interviewPassRate = interviewPassRate; }

    public long getActiveCandidatesInPipeline() { return activeCandidatesInPipeline; }
    public void setActiveCandidatesInPipeline(long activeCandidatesInPipeline) { this.activeCandidatesInPipeline = activeCandidatesInPipeline; }

    public long getHiredCount() { return hiredCount; }
    public void setHiredCount(long hiredCount) { this.hiredCount = hiredCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }
}

