package com.talentflow.backend.dto.auth;

import com.talentflow.backend.entity.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendOtpRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotNull(message = "OTP purpose is required (LOGIN, FORGOT_PASSWORD, or REGISTRATION)")
    private OtpPurpose purpose = OtpPurpose.LOGIN;

    public SendOtpRequest() {}

    public SendOtpRequest(String email, OtpPurpose purpose) {
        this.email = email;
        this.purpose = purpose;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public OtpPurpose getPurpose() { return purpose; }
    public void setPurpose(OtpPurpose purpose) { this.purpose = purpose; }
}

