package com.talentflow.backend.dto.job;

import com.talentflow.backend.entity.SkillCategory;
import com.talentflow.backend.entity.SkillRequirementLevel;

public class JobSkillDTO {

    private Long id;
    private Long skillId;
    private String skillName;
    private SkillCategory category;
    private SkillRequirementLevel requirementLevel;
    private Double minYearsExperience;

    public JobSkillDTO() {}

    public JobSkillDTO(Long id, Long skillId, String skillName, SkillCategory category,
                       SkillRequirementLevel requirementLevel, Double minYearsExperience) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.requirementLevel = requirementLevel;
        this.minYearsExperience = minYearsExperience;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public SkillCategory getCategory() { return category; }
    public void setCategory(SkillCategory category) { this.category = category; }

    public SkillRequirementLevel getRequirementLevel() { return requirementLevel; }
    public void setRequirementLevel(SkillRequirementLevel requirementLevel) { this.requirementLevel = requirementLevel; }

    public Double getMinYearsExperience() { return minYearsExperience; }
    public void setMinYearsExperience(Double minYearsExperience) { this.minYearsExperience = minYearsExperience; }
}

