package com.talentflow.backend.dto.analytics;

public class JobPerformanceMetricDto {

    private Long jobId;
    private String title;
    private String companyName;
    private String location;
    private String workplaceType;
    private String employmentType;
    private String status;
    private Double minSalary;
    private Double maxSalary;
    private Integer vacanciesCount;
    private long totalApplicants;
    private long shortlistedCount;
    private long interviewsCount;
    private long offersCount;
    private long hiredCount;
    private double avgTimeToHireDays;
    private double conversionRate;

    public JobPerformanceMetricDto() {}

    public JobPerformanceMetricDto(Long jobId, String title, String companyName, String location,
                                   String workplaceType, String employmentType, String status,
                                   Double minSalary, Double maxSalary, Integer vacanciesCount,
                                   long totalApplicants, long shortlistedCount, long interviewsCount,
                                   long offersCount, long hiredCount, double avgTimeToHireDays,
                                   double conversionRate) {
        this.jobId = jobId;
        this.title = title;
        this.companyName = companyName;
        this.location = location;
        this.workplaceType = workplaceType;
        this.employmentType = employmentType;
        this.status = status;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.vacanciesCount = vacanciesCount;
        this.totalApplicants = totalApplicants;
        this.shortlistedCount = shortlistedCount;
        this.interviewsCount = interviewsCount;
        this.offersCount = offersCount;
        this.hiredCount = hiredCount;
        this.avgTimeToHireDays = avgTimeToHireDays;
        this.conversionRate = conversionRate;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkplaceType() { return workplaceType; }
    public void setWorkplaceType(String workplaceType) { this.workplaceType = workplaceType; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getMinSalary() { return minSalary; }
    public void setMinSalary(Double minSalary) { this.minSalary = minSalary; }

    public Double getMaxSalary() { return maxSalary; }
    public void setMaxSalary(Double maxSalary) { this.maxSalary = maxSalary; }

    public Integer getVacanciesCount() { return vacanciesCount; }
    public void setVacanciesCount(Integer vacanciesCount) { this.vacanciesCount = vacanciesCount; }

    public long getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(long totalApplicants) { this.totalApplicants = totalApplicants; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getInterviewsCount() { return interviewsCount; }
    public void setInterviewsCount(long interviewsCount) { this.interviewsCount = interviewsCount; }

    public long getOffersCount() { return offersCount; }
    public void setOffersCount(long offersCount) { this.offersCount = offersCount; }

    public long getHiredCount() { return hiredCount; }
    public void setHiredCount(long hiredCount) { this.hiredCount = hiredCount; }

    public double getAvgTimeToHireDays() { return avgTimeToHireDays; }
    public void setAvgTimeToHireDays(double avgTimeToHireDays) { this.avgTimeToHireDays = avgTimeToHireDays; }

    public double getConversionRate() { return conversionRate; }
    public void setConversionRate(double conversionRate) { this.conversionRate = conversionRate; }
}

