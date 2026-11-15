package com.talentflow.backend.dto.analytics;

public class FunnelStageMetricDto {

    private String stage;
    private String displayName;
    private long count;
    private double conversionPercentage;
    private double dropOffRate;

    public FunnelStageMetricDto() {}

    public FunnelStageMetricDto(String stage, String displayName, long count,
                                double conversionPercentage, double dropOffRate) {
        this.stage = stage;
        this.displayName = displayName;
        this.count = count;
        this.conversionPercentage = conversionPercentage;
        this.dropOffRate = dropOffRate;
    }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public double getConversionPercentage() { return conversionPercentage; }
    public void setConversionPercentage(double conversionPercentage) { this.conversionPercentage = conversionPercentage; }

    public double getDropOffRate() { return dropOffRate; }
    public void setDropOffRate(double dropOffRate) { this.dropOffRate = dropOffRate; }
}

