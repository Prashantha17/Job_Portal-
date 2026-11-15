package com.talentflow.backend.repository;

import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.CandidateSkill;
import com.talentflow.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateProfile(CandidateProfile candidateProfile);
    Optional<CandidateSkill> findByCandidateProfileAndSkill(CandidateProfile candidateProfile, Skill skill);
    void deleteByCandidateProfileAndSkill(CandidateProfile candidateProfile, Skill skill);

    @Query("SELECT cs.skill.name, COUNT(DISTINCT cs.candidateProfile.id) FROM CandidateSkill cs WHERE cs.candidateProfile.id IN (SELECT a.candidateProfile.id FROM Application a WHERE a.job.postedBy.id = :recruiterId) GROUP BY cs.skill.name ORDER BY COUNT(DISTINCT cs.candidateProfile.id) DESC")
    List<Object[]> countApplicantSkillSupplyForRecruiter(@Param("recruiterId") Long recruiterId);
}


