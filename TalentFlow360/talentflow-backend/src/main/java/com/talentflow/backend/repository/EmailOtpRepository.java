package com.talentflow.backend.repository;

import com.talentflow.backend.entity.EmailOtp;
import com.talentflow.backend.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findTopByEmailAndPurposeAndUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String email, OtpPurpose purpose, Instant now
    );
}

