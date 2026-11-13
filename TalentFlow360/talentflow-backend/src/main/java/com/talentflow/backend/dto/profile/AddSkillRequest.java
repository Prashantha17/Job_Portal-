package com.talentflow.backend.dto.profile;

import com.talentflow.backend.entity.ProficiencyLevel;
import com.talentflow.backend.entity.SkillCategory;
import jakarta.validation.constraints.NotBlank;

public class AddSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String skillName;

    private SkillCategory category = SkillCategory.GENERAL;
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.INTERMEDIATE;
    private Double yearsOfExperience = 1.0;

    public AddSkillRequest() {}

    public AddSkillRequest(String skillName, SkillCategory category, ProficiencyLevel proficiencyLevel, Double yearsOfExperience) {
        this.skillName = skillName;
        this.category = category != null ? category : SkillCategory.GENERAL;
        this.proficiencyLevel = proficiencyLevel != null ? proficiencyLevel : ProficiencyLevel.INTERMEDIATE;
        this.yearsOfExperience = yearsOfExperience != null ? yearsOfExperience : 1.0;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public SkillCategory getCategory() { return category; }
    public void setCategory(SkillCategory category) { this.category = category; }

    public ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Double getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
}

