package com.talentflow.backend.repository;

import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUser(User user);
    Optional<CandidateProfile> findByUserEmail(String email);
    Optional<CandidateProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);

    @Query("SELECT DISTINCT cp FROM CandidateProfile cp LEFT JOIN FETCH cp.skills s LEFT JOIN FETCH s.skill")
    List<CandidateProfile> findAllWithSkills();

    @Query("SELECT DISTINCT cp FROM CandidateProfile cp LEFT JOIN FETCH cp.skills s LEFT JOIN FETCH s.skill WHERE cp.user.email = :email")
    Optional<CandidateProfile> findByUserEmailWithSkills(@Param("email") String email);

    @Query("SELECT DISTINCT cp FROM CandidateProfile cp LEFT JOIN FETCH cp.skills s LEFT JOIN FETCH s.skill WHERE cp.id = :id")
    Optional<CandidateProfile> findByIdWithSkills(@Param("id") Long id);
}


