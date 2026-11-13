package com.talentflow.backend.dto.profile;

import com.talentflow.backend.entity.ProficiencyLevel;
import com.talentflow.backend.entity.SkillCategory;

public class CandidateSkillDTO {
    private Long id;
    private Long skillId;
    private String skillName;
    private SkillCategory category;
    private ProficiencyLevel proficiencyLevel;
    private Double yearsOfExperience;

    public CandidateSkillDTO() {}

    public CandidateSkillDTO(Long id, Long skillId, String skillName, SkillCategory category,
                             ProficiencyLevel proficiencyLevel, Double yearsOfExperience) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.proficiencyLevel = proficiencyLevel;
        this.yearsOfExperience = yearsOfExperience;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public SkillCategory getCategory() { return category; }
    public void setCategory(SkillCategory category) { this.category = category; }

    public ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Double getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
}

