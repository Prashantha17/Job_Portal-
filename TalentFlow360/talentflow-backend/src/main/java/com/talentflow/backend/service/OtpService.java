package com.talentflow.backend.service;

import com.talentflow.backend.entity.EmailOtp;
import com.talentflow.backend.entity.OtpPurpose;
import com.talentflow.backend.exception.ApiException;
import com.talentflow.backend.repository.EmailOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom random = new SecureRandom();

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    public OtpService(EmailOtpRepository emailOtpRepository, EmailService emailService) {
        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public String generateAndSendOtp(String email, OtpPurpose purpose) {
        String cleanEmail = email.toLowerCase().trim();

        // Generate 6-digit cryptographic code
        int code = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(code);

        Instant expiryTime = Instant.now().plus(10, ChronoUnit.MINUTES);
        EmailOtp emailOtp = new EmailOtp(cleanEmail, otpCode, purpose, expiryTime);
        emailOtpRepository.save(emailOtp);

        log.info("Generated {} OTP for {}: {}", purpose, cleanEmail, otpCode);

        // Send Email
        if (purpose == OtpPurpose.LOGIN) {
            emailService.sendLoginOtpEmail(cleanEmail, otpCode);
        } else if (purpose == OtpPurpose.FORGOT_PASSWORD) {
            emailService.sendForgotPasswordOtpEmail(cleanEmail, otpCode);
        } else if (purpose == OtpPurpose.REGISTRATION) {
            emailService.sendRegistrationOtpEmail(cleanEmail, otpCode);
        }

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode, OtpPurpose purpose) {
        String cleanEmail = email.toLowerCase().trim();
        String cleanOtp = otpCode.trim();

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailAndPurposeAndUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
                        cleanEmail, purpose, Instant.now()
                )
                .orElseThrow(() -> new ApiException("Invalid or expired OTP. Please request a new code.", HttpStatus.BAD_REQUEST));

        if (!emailOtp.getOtpCode().equals(cleanOtp)) {
            throw new ApiException("Incorrect verification code. Please check your inbox.", HttpStatus.BAD_REQUEST);
        }

        emailOtp.setUsed(true);
        emailOtpRepository.save(emailOtp);
        log.info("OTP successfully verified for {} ({})", cleanEmail, purpose);
        return true;
    }
}
