package com.talentflow.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid Google email address")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String googleId;

    private String avatarUrl;

    private String role; // "ROLE_JOB_SEEKER" or "ROLE_RECRUITER"

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String email, String firstName, String lastName, String googleId, String avatarUrl, String role) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.googleId = googleId;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

