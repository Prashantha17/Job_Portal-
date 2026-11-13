package com.talentflow.backend.dto.job;

import com.talentflow.backend.entity.SkillRequirementLevel;
import jakarta.validation.constraints.NotBlank;

public class JobSkillRequest {

    private Long skillId;

    @NotBlank(message = "Skill name is required")
    private String skillName;

    private SkillRequirementLevel requirementLevel = SkillRequirementLevel.REQUIRED;
    private Double minYearsExperience = 1.0;

    public JobSkillRequest() {}

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public SkillRequirementLevel getRequirementLevel() { return requirementLevel; }
    public void setRequirementLevel(SkillRequirementLevel requirementLevel) { this.requirementLevel = requirementLevel; }

    public Double getMinYearsExperience() { return minYearsExperience; }
    public void setMinYearsExperience(Double minYearsExperience) { this.minYearsExperience = minYearsExperience; }
}

