package com.talentflow.backend.dto.analytics;

public class ApplicationTrendPointDto {

    private String period;
    private long applicationCount;
    private long hiredCount;

    public ApplicationTrendPointDto() {}

    public ApplicationTrendPointDto(String period, long applicationCount, long hiredCount) {
        this.period = period;
        this.applicationCount = applicationCount;
        this.hiredCount = hiredCount;
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public long getApplicationCount() { return applicationCount; }
    public void setApplicationCount(long applicationCount) { this.applicationCount = applicationCount; }

    public long getHiredCount() { return hiredCount; }
    public void setHiredCount(long hiredCount) { this.hiredCount = hiredCount; }
}

