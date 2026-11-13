package com.talentflow.backend.repository;

import com.talentflow.backend.entity.RecruiterProfile;
import com.talentflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUser(User user);
    Optional<RecruiterProfile> findByUserEmail(String email);
    Optional<RecruiterProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}

