package com.talentflow.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateRecruiterProfileRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String companyName;

    @NotBlank(message = "Designation is required")
    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @Size(max = 150, message = "Corporate email cannot exceed 150 characters")
    private String corporateEmail;

    @Size(max = 30, message = "Corporate phone cannot exceed 30 characters")
    private String corporatePhone;

    @Size(max = 255, message = "LinkedIn URL cannot exceed 255 characters")
    private String linkedinUrl;

    public UpdateRecruiterProfileRequest() {}

    public UpdateRecruiterProfileRequest(String companyName, String designation, String department,
                                        String corporateEmail, String corporatePhone, String linkedinUrl) {
        this.companyName = companyName;
        this.designation = designation;
        this.department = department;
        this.corporateEmail = corporateEmail;
        this.corporatePhone = corporatePhone;
        this.linkedinUrl = linkedinUrl;
    }

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
}

