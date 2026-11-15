package com.talentflow.backend.dto.analytics;

import java.util.List;

public class StageFunnelDto {

    private long totalApplications;
    private List<FunnelStageMetricDto> stages;
    private long rejectedCount;
    private long withdrawnCount;

    public StageFunnelDto() {}

    public StageFunnelDto(long totalApplications, List<FunnelStageMetricDto> stages, long rejectedCount, long withdrawnCount) {
        this.totalApplications = totalApplications;
        this.stages = stages;
        this.rejectedCount = rejectedCount;
        this.withdrawnCount = withdrawnCount;
    }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public List<FunnelStageMetricDto> getStages() { return stages; }
    public void setStages(List<FunnelStageMetricDto> stages) { this.stages = stages; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public long getWithdrawnCount() { return withdrawnCount; }
    public void setWithdrawnCount(long withdrawnCount) { this.withdrawnCount = withdrawnCount; }
}

