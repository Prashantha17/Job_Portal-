package com.talentflow.backend.controller;

import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates")
@Tag(name = "Candidate Profile", description = "Candidate profile, education, work experience, skills, and resume APIs")
@SecurityRequirement(name = "BearerAuth")
public class CandidateController {

    private final ProfileService profileService;

    public CandidateController(ProfileService profileService) {
        this.profileService = profileService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get current candidate's profile with full portfolio")
    public ResponseEntity<CandidateProfileResponse> getMyProfile(Authentication authentication) {
        CandidateProfileResponse profile = profileService.getCandidateProfile(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Update current candidate's profile details")
    public ResponseEntity<CandidateProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateCandidateProfileRequest request,
            Authentication authentication) {
        CandidateProfileResponse updated = profileService.updateCandidateProfile(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/education")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Add education entry to candidate profile")
    public ResponseEntity<EducationDTO> addEducation(
            @Valid @RequestBody EducationDTO request,
            Authentication authentication) {
        EducationDTO created = profileService.addEducation(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/me/education/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Delete education entry from candidate profile")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long id,
            Authentication authentication) {
        profileService.deleteEducation(getAuthenticatedEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/experience")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Add work experience entry to candidate profile")
    public ResponseEntity<ExperienceDTO> addExperience(
            @Valid @RequestBody ExperienceDTO request,
            Authentication authentication) {
        ExperienceDTO created = profileService.addExperience(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/me/experience/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Delete work experience entry from candidate profile")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable Long id,
            Authentication authentication) {
        profileService.deleteExperience(getAuthenticatedEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/skills")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Add or update candidate skill")
    public ResponseEntity<CandidateSkillDTO> addSkill(
            @Valid @RequestBody AddSkillRequest request,
            Authentication authentication) {
        CandidateSkillDTO created = profileService.addCandidateSkill(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/me/skills/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Remove skill from candidate profile")
    public ResponseEntity<Void> removeSkill(
            @PathVariable Long id,
            Authentication authentication) {
        profileService.removeCandidateSkill(getAuthenticatedEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/resume")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Upload or register a candidate resume")
    public ResponseEntity<ResumeDTO> uploadResume(
            @Valid @RequestBody UploadResumeRequest request,
            Authentication authentication) {
        ResumeDTO created = profileService.uploadResume(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me/resume")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all uploaded resumes for current candidate")
    public ResponseEntity<List<ResumeDTO>> getResumes(Authentication authentication) {
        List<ResumeDTO> resumes = profileService.getResumes(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(resumes);
    }

    @DeleteMapping("/me/resume/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Delete resume entry")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long id,
            Authentication authentication) {
        profileService.deleteResume(getAuthenticatedEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/resume/{id}/primary")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Set resume as primary")
    public ResponseEntity<ResumeDTO> setPrimaryResume(
            @PathVariable Long id,
            Authentication authentication) {
        ResumeDTO updated = profileService.setPrimaryResume(getAuthenticatedEmail(authentication), id);
        return ResponseEntity.ok(updated);
    }
}
