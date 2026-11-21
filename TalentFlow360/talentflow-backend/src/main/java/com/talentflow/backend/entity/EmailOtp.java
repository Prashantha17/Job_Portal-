package com.talentflow.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_otps", indexes = {
        @Index(name = "idx_otp_email_purpose", columnList = "email, purpose"),
        @Index(name = "idx_otp_lookup", columnList = "email, purpose, is_used, expiry_time, created_at")
})
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OtpPurpose purpose;

    @Column(name = "expiry_time", nullable = false)
    private Instant expiryTime;

    @Column(name = "is_used", nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public EmailOtp() {}

    public EmailOtp(String email, String otpCode, OtpPurpose purpose, Instant expiryTime) {
        this.email = email.toLowerCase().trim();
        this.otpCode = otpCode;
        this.purpose = purpose;
        this.expiryTime = expiryTime;
        this.used = false;
        this.createdAt = Instant.now();
    }

    public boolean isValid() {
        return !used && Instant.now().isBefore(expiryTime);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.toLowerCase().trim() : null; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public OtpPurpose getPurpose() { return purpose; }
    public void setPurpose(OtpPurpose purpose) { this.purpose = purpose; }

    public Instant getExpiryTime() { return expiryTime; }
    public void setExpiryTime(Instant expiryTime) { this.expiryTime = expiryTime; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

