package com.talentflow.backend.repository;

import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.CandidateSkill;
import com.talentflow.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateProfile(CandidateProfile candidateProfile);
    Optional<CandidateSkill> findByCandidateProfileAndSkill(CandidateProfile candidateProfile, Skill skill);
    void deleteByCandidateProfileAndSkill(CandidateProfile candidateProfile, Skill skill);
}

