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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get candidate profile by ID for recruiters and administrators")
    public ResponseEntity<CandidateProfileResponse> getCandidateProfileById(@PathVariable Long id) {
        CandidateProfileResponse profile = profileService.getCandidateProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get candidate profile by email for recruiters and administrators")
    public ResponseEntity<CandidateProfileResponse> getCandidateProfileByEmail(@RequestParam String email) {
        CandidateProfileResponse profile = profileService.getCandidateProfile(email);
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

    @PostMapping("/me/generate-summary")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "AI-generate an ATS-optimized professional summary using candidate skills, experiences, educations, and resume")
    public ResponseEntity<GenerateSummaryResponse> generateAiSummary(
            @RequestBody(required = false) GenerateSummaryRequest request,
            @RequestParam(value = "tone", required = false) String toneParam,
            Authentication authentication) {
        if (request == null) {
            request = new GenerateSummaryRequest();
        }
        if (toneParam != null && !toneParam.isBlank() && (request.getTone() == null || request.getTone().isBlank())) {
            request.setTone(toneParam);
        }
        GenerateSummaryResponse response = profileService.generateAiProfessionalSummary(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(response);
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

    @PostMapping(value = "/me/resume/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Upload resume file from device and store in MongoDB", description = "Stores raw file bytes & parsed text in MongoDB collection 'resumes' and syncs metadata to MySQL.")
    public ResponseEntity<ResumeDTO> uploadResumeFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "isPrimary", defaultValue = "true") boolean isPrimary,
            Authentication authentication) throws java.io.IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded resume file cannot be empty");
        }
        ResumeDTO created = profileService.uploadResumeFile(getAuthenticatedEmail(authentication), file, title, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    private void validateResumeAccess(com.talentflow.backend.document.ResumeDocument doc, String actorEmail, Authentication authentication) {
        boolean isPrivileged = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECRUITER") ||
                               a.getAuthority().equals("ROLE_HR_MANAGER") ||
                               a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (isPrivileged) {
            return;
        }

        if (doc.getCandidateProfileId() != null) {
            try {
                CandidateProfileResponse profile = profileService.getCandidateProfile(actorEmail);
                if (profile != null && profile.getId().equals(doc.getCandidateProfileId())) {
                    return;
                }
            } catch (Exception ignored) {}
        }
        throw new org.springframework.security.access.AccessDeniedException("You are not authorized to download this candidate's resume.");
    }

    @GetMapping(value = "/resumes/{mongoId}/download", produces = { "application/pdf", "application/octet-stream", "*/*" })
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Download candidate resume directly from MongoDB document storage")
    public ResponseEntity<byte[]> downloadResumeFromMongo(
            @PathVariable String mongoId,
            Authentication authentication) {
        String actorEmail = getAuthenticatedEmail(authentication);
        java.util.Optional<com.talentflow.backend.document.ResumeDocument> docOpt = profileService.getResumeDocument(mongoId);

        // Fallback: If mongoId is numeric, try SQL ID lookup
        if (docOpt.isEmpty() && mongoId.matches("\\d+")) {
            docOpt = profileService.getResumeDocumentBySqlId(Long.parseLong(mongoId));
        }

        com.talentflow.backend.document.ResumeDocument doc = docOpt
                .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("ResumeDocument", "id", mongoId));

        validateResumeAccess(doc, actorEmail, authentication);

        String contentType = doc.getContentType() != null ? doc.getContentType() : "application/pdf";
        String fileName = doc.getFileName() != null ? doc.getFileName() : "Resume.pdf";
        byte[] data = doc.getFileData() != null ? doc.getFileData() : new byte[0];

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(data);
    }

    @GetMapping(value = "/resumes/by-id/{resumeId}/download", produces = { "application/pdf", "application/octet-stream", "*/*" })
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Download candidate resume by SQL ID from MongoDB document storage")
    public ResponseEntity<byte[]> downloadResumeBySqlId(
            @PathVariable Long resumeId,
            Authentication authentication) {
        String actorEmail = getAuthenticatedEmail(authentication);
        com.talentflow.backend.document.ResumeDocument doc = profileService.getResumeDocumentBySqlId(resumeId)
                .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("ResumeDocument", "resumeId", resumeId));

        validateResumeAccess(doc, actorEmail, authentication);

        String contentType = doc.getContentType() != null ? doc.getContentType() : "application/pdf";
        String fileName = doc.getFileName() != null ? doc.getFileName() : "Resume.pdf";
        byte[] data = doc.getFileData() != null ? doc.getFileData() : new byte[0];

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(data);
    }
}
