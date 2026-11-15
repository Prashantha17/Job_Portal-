package com.talentflow.backend.dto.analytics;

import java.util.List;

public class RecruiterAnalyticsResponse {

    private RecruiterOverviewDto overview;
    private StageFunnelDto funnel;
    private List<ApplicationTrendPointDto> applicationTrends;
    private List<SkillVelocityDto> skillsVelocity;
    private List<JobPerformanceMetricDto> jobPerformance;

    public RecruiterAnalyticsResponse() {}

    public RecruiterAnalyticsResponse(RecruiterOverviewDto overview,
                                      StageFunnelDto funnel,
                                      List<ApplicationTrendPointDto> applicationTrends,
                                      List<SkillVelocityDto> skillsVelocity,
                                      List<JobPerformanceMetricDto> jobPerformance) {
        this.overview = overview;
        this.funnel = funnel;
        this.applicationTrends = applicationTrends;
        this.skillsVelocity = skillsVelocity;
        this.jobPerformance = jobPerformance;
    }

    public RecruiterOverviewDto getOverview() { return overview; }
    public void setOverview(RecruiterOverviewDto overview) { this.overview = overview; }

    public StageFunnelDto getFunnel() { return funnel; }
    public void setFunnel(StageFunnelDto funnel) { this.funnel = funnel; }

    public List<ApplicationTrendPointDto> getApplicationTrends() { return applicationTrends; }
    public void setApplicationTrends(List<ApplicationTrendPointDto> applicationTrends) { this.applicationTrends = applicationTrends; }

    public List<SkillVelocityDto> getSkillsVelocity() { return skillsVelocity; }
    public void setSkillsVelocity(List<SkillVelocityDto> skillsVelocity) { this.skillsVelocity = skillsVelocity; }

    public List<JobPerformanceMetricDto> getJobPerformance() { return jobPerformance; }
    public void setJobPerformance(List<JobPerformanceMetricDto> jobPerformance) { this.jobPerformance = jobPerformance; }
}

