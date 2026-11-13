package com.talentflow.backend.service;

import com.talentflow.backend.dto.profile.SkillDTO;
import com.talentflow.backend.entity.Skill;
import com.talentflow.backend.entity.SkillCategory;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.mapper.ProfileMapper;
import com.talentflow.backend.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final ProfileMapper profileMapper;

    public SkillService(SkillRepository skillRepository, ProfileMapper profileMapper) {
        this.skillRepository = skillRepository;
        this.profileMapper = profileMapper;
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> getAllSkills() {
        return profileMapper.toSkillDTOList(skillRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> searchSkills(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSkills();
        }
        return profileMapper.toSkillDTOList(skillRepository.findByNameContainingIgnoreCase(query.trim()));
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> getSkillsByCategory(SkillCategory category) {
        return profileMapper.toSkillDTOList(skillRepository.findByCategory(category));
    }

    @Transactional
    public SkillDTO createSkill(SkillDTO request) {
        String trimmedName = request.getName().trim();
        Skill skill = skillRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> {
                    SkillCategory cat = request.getCategory() != null ? request.getCategory() : SkillCategory.GENERAL;
                    return skillRepository.save(new Skill(trimmedName, cat));
                });
        return profileMapper.toSkillDTO(skill);
    }

    @Transactional
    public Skill getOrCreateSkill(String name) {
        return findOrCreateSkill(name, SkillCategory.GENERAL);
    }

    @Transactional
    public Skill findOrCreateSkill(String name, SkillCategory category) {
        String trimmedName = name.trim();
        return skillRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> skillRepository.save(
                        new Skill(trimmedName, category != null ? category : SkillCategory.GENERAL)
                ));
    }
}

