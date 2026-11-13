package com.talentflow.backend.repository;

import com.talentflow.backend.entity.Skill;
import com.talentflow.backend.entity.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Skill> findByCategory(SkillCategory category);
    List<Skill> findByNameContainingIgnoreCase(String query);
}

