package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.application.ApplicationResponse;
import com.talentflow.backend.dto.application.ApplicationStatusHistoryResponse;
import com.talentflow.backend.dto.application.ApplyJobRequest;
import com.talentflow.backend.dto.application.UpdateApplicationStatusRequest;
import com.talentflow.backend.entity.Application;
import com.talentflow.backend.entity.Resume;
import com.talentflow.backend.document.ResumeDocument;
import com.talentflow.backend.service.ApplicationService;
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
@RequestMapping("/api/v1/applications")
@Tag(name = "Job Applications & ATS", description = "Application submission, candidate application tracker, and recruiter ATS pipeline APIs")
@SecurityRequirement(name = "BearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final com.talentflow.backend.service.AtsResumeAnalyzerService atsResumeAnalyzerService;
    private final com.talentflow.backend.repository.JobRepository jobRepository;
    private final com.talentflow.backend.repository.ResumeRepository resumeRepository;
    private final com.talentflow.backend.service.ProfileService profileService;
    private final com.talentflow.backend.repository.ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationService applicationService,
                                 com.talentflow.backend.service.AtsResumeAnalyzerService atsResumeAnalyzerService,
                                 com.talentflow.backend.repository.JobRepository jobRepository,
                                 com.talentflow.backend.repository.ResumeRepository resumeRepository,
                                 com.talentflow.backend.service.ProfileService profileService,
                                 com.talentflow.backend.repository.ApplicationRepository applicationRepository) {
        this.applicationService = applicationService;
        this.atsResumeAnalyzerService = atsResumeAnalyzerService;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.profileService = profileService;
        this.applicationRepository = applicationRepository;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Submit job application with portfolio & resume", description = "Submits a new job application and automatically dispatches a confirmation email to the candidate's inbox.")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForJob(
            @Valid @RequestBody ApplyJobRequest request,
            Authentication authentication) {
        ApplicationResponse response = applicationService.applyForJob(getAuthenticatedEmail(authentication), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Application submitted successfully. A confirmation email has been dispatched to your inbox.", response));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get current candidate's submitted applications", description = "Returns all active job applications for the logged-in candidate with real-time ATS statuses.")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(Authentication authentication) {
        List<ApplicationResponse> list = applicationService.getCandidateApplications(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Candidate applications retrieved", list));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get applicants for a specific job vacancy", description = "Returns all submitted candidate applications for a job listing to review in the recruiter ATS pipeline.")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {
        List<ApplicationResponse> list = applicationService.getJobApplications(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job applicants retrieved successfully", list));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update applicant ATS pipeline stage", description = "Transitions candidate status across the 10-stage recruitment workflow with audit trail.")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication) {
        ApplicationResponse updated = applicationService.updateApplicationStatus(id, getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(ApiResponse.ok("Applicant status updated successfully", updated));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get application status transition history", description = "Returns full chronological audit trail of all ATS status changes and recruiter remarks for an application.")
    public ResponseEntity<ApiResponse<List<ApplicationStatusHistoryResponse>>> getStatusHistory(
            @PathVariable Long id,
            Authentication authentication) {
        List<ApplicationStatusHistoryResponse> history = applicationService.getApplicationHistory(id, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application history retrieved successfully", history));
    }

    @GetMapping("/{id}/ats-analysis")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get MongoDB-backed AI ATS Resume Analysis for an application", description = "Fetches the detailed keyword match, score breakdown, and recommendations stored in MongoDB.")
    public ResponseEntity<ApiResponse<com.talentflow.backend.document.AtsAnalysisDocument>> getApplicationAtsAnalysis(
            @PathVariable Long id,
            Authentication authentication) {
        com.talentflow.backend.document.AtsAnalysisDocument doc = atsResumeAnalyzerService.getAnalysisByApplicationId(id)
                .orElseGet(() -> {
                    // On-demand generation and persistence for legacy or existing applications
                    com.talentflow.backend.entity.Application app = applicationRepository.findById(id)
                            .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("Application", "id", id));
                    com.talentflow.backend.document.AtsAnalysisDocument generated = atsResumeAnalyzerService.analyzeAndSave(app, app.getJob(), app.getResume());
                    if (app.getAtsScore() == null) {
                        app.setAtsScore(generated.getAtsScore());
                        app.setAtsMatchTier(generated.getMatchTier());
                        applicationRepository.save(app);
                    }
                    return generated;
                });
        return ResponseEntity.ok(ApiResponse.ok("ATS analysis retrieved from MongoDB", doc));
    }

    @PostMapping(value = "/analyze-ats", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "AI ATS Resume Scanner & Mistakes Audit", description = "Scans a resume file (from device or saved resume) against a specific job or provides a standalone audit with ATS score, detected mistakes, and step-by-step improvements.")
    public ResponseEntity<ApiResponse<com.talentflow.backend.document.AtsAnalysisDocument>> analyzeAtsPreApplication(
            @RequestParam(value = "jobId", required = false) Long jobId,
            @RequestParam(value = "targetRole", required = false) String targetRole,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "resumeId", required = false) Long resumeId,
            Authentication authentication) throws java.io.IOException {

        String userEmail = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "candidate@talentflow360.com";

        String resumeText = "";
        String fileName = "Resume.pdf";

        if (file != null && !file.isEmpty()) {
            byte[] bytes = file.getBytes();
            fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "UploadedResume.pdf";
            resumeText = atsResumeAnalyzerService.extractText(bytes, file.getContentType(), fileName);
        } else if (resumeId != null) {
            java.util.Optional<com.talentflow.backend.document.ResumeDocument> docOpt = profileService.getResumeDocumentBySqlId(resumeId);
            if (docOpt.isPresent()) {
                resumeText = docOpt.get().getParsedText();
                fileName = docOpt.get().getFileName();
            }
        }

        if (resumeText.isBlank() && authentication != null) {
            try {
                com.talentflow.backend.entity.CandidateProfile cand = profileService.getOrCreateCandidateProfileEntity(userEmail);
                java.util.Optional<com.talentflow.backend.document.ResumeDocument> primary = profileService.getResumeDocumentBySqlId(cand.getId());
                if (primary.isPresent()) {
                    resumeText = primary.get().getParsedText();
                    fileName = primary.get().getFileName();
                }
            } catch (Exception ignored) {}
        }

        com.talentflow.backend.document.AtsAnalysisDocument analysis;
        if (jobId != null) {
            com.talentflow.backend.entity.Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("Job", "id", jobId));
            analysis = atsResumeAnalyzerService.evaluatePreApplication(resumeText, fileName, job, userEmail);
        } else {
            analysis = atsResumeAnalyzerService.auditResumeStandalone(resumeText, fileName, targetRole, userEmail);
        }

        return ResponseEntity.ok(ApiResponse.ok("Real-time ATS analysis calculated", analysis));
    }

    @GetMapping("/{id}/resume/download")
    @Operation(summary = "Download resume for application", description = "Streams the resume file associated with this application from MongoDB.")
    public ResponseEntity<byte[]> downloadApplicationResume(@PathVariable Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("Application", "id", id));

        java.util.Optional<com.talentflow.backend.document.ResumeDocument> docOpt = java.util.Optional.empty();
        if (app.getResume() != null) {
            docOpt = profileService.getResumeDocumentBySqlId(app.getResume().getId());
        }
        if (docOpt.isEmpty() && app.getCandidateProfile() != null) {
            docOpt = profileService.getResumeDocumentBySqlId(app.getCandidateProfile().getId());
        }

        com.talentflow.backend.document.ResumeDocument doc = docOpt
                .orElseThrow(() -> new com.talentflow.backend.exception.ResourceNotFoundException("ResumeDocument", "applicationId", id));

        String fileName = doc.getFileName() != null ? doc.getFileName() : "Application_Resume.pdf";
        String contentType = doc.getContentType() != null ? doc.getContentType() : "application/pdf";
        byte[] bytes = doc.getFileData() != null ? doc.getFileData() : new byte[0];

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}

