package com.talentflow.backend.dto.analytics;

public class SkillVelocityDto {

    private String skillName;
    private long demandCount;
    private long supplyCount;
    private double demandSupplyRatio;
    private String demandLevel; // HIGH, MEDIUM, MODERATE

    public SkillVelocityDto() {}

    public SkillVelocityDto(String skillName, long demandCount, long supplyCount,
                            double demandSupplyRatio, String demandLevel) {
        this.skillName = skillName;
        this.demandCount = demandCount;
        this.supplyCount = supplyCount;
        this.demandSupplyRatio = demandSupplyRatio;
        this.demandLevel = demandLevel;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public long getDemandCount() { return demandCount; }
    public void setDemandCount(long demandCount) { this.demandCount = demandCount; }

    public long getSupplyCount() { return supplyCount; }
    public void setSupplyCount(long supplyCount) { this.supplyCount = supplyCount; }

    public double getDemandSupplyRatio() { return demandSupplyRatio; }
    public void setDemandSupplyRatio(double demandSupplyRatio) { this.demandSupplyRatio = demandSupplyRatio; }

    public String getDemandLevel() { return demandLevel; }
    public void setDemandLevel(String demandLevel) { this.demandLevel = demandLevel; }
}

