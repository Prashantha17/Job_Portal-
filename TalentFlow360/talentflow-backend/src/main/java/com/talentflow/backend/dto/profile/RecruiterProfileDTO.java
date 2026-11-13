package com.talentflow.backend.dto.profile;

import java.time.Instant;

public class RecruiterProfileDTO {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String companyName;
    private String designation;
    private String department;
    private String corporateEmail;
    private String corporatePhone;
    private String linkedinUrl;
    private boolean isVerified;
    private Instant createdAt;
    private Instant updatedAt;

    public RecruiterProfileDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCorporateEmail() { return corporateEmail; }
    public void setCorporateEmail(String corporateEmail) { this.corporateEmail = corporateEmail; }

    public String getCorporatePhone() { return corporatePhone; }
    public void setCorporatePhone(String corporatePhone) { this.corporatePhone = corporatePhone; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final RecruiterProfileDTO dto = new RecruiterProfileDTO();

        public Builder id(Long id) { dto.id = id; return this; }
        public Builder userId(Long userId) { dto.userId = userId; return this; }
        public Builder email(String email) { dto.email = email; return this; }
        public Builder fullName(String fullName) { dto.fullName = fullName; return this; }
        public Builder companyName(String companyName) { dto.companyName = companyName; return this; }
        public Builder designation(String designation) { dto.designation = designation; return this; }
        public Builder department(String department) { dto.department = department; return this; }
        public Builder corporateEmail(String corporateEmail) { dto.corporateEmail = corporateEmail; return this; }
        public Builder corporatePhone(String corporatePhone) { dto.corporatePhone = corporatePhone; return this; }
        public Builder linkedinUrl(String linkedinUrl) { dto.linkedinUrl = linkedinUrl; return this; }
        public Builder isVerified(boolean isVerified) { dto.isVerified = isVerified; return this; }
        public Builder createdAt(Instant createdAt) { dto.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { dto.updatedAt = updatedAt; return this; }

        public RecruiterProfileDTO build() {
            return dto;
        }
    }
}

