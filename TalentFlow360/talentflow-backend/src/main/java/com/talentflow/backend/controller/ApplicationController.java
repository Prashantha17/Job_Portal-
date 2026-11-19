package com.talentflow.backend.controller;

import com.talentflow.backend.document.AtsAnalysisDocument;
import com.talentflow.backend.document.ResumeDocument;
import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.application.ApplicationResponse;
import com.talentflow.backend.dto.application.ApplicationStatusHistoryResponse;
import com.talentflow.backend.dto.application.ApplyJobRequest;
import com.talentflow.backend.dto.application.ConstructiveFeedbackResponse;
import com.talentflow.backend.dto.application.SendOfferLetterRequest;
import com.talentflow.backend.dto.application.UpdateApplicationStatusRequest;
import com.talentflow.backend.entity.Application;
import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.Resume;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.ApplicationRepository;
import com.talentflow.backend.repository.JobRepository;
import com.talentflow.backend.repository.ResumeRepository;
import com.talentflow.backend.service.ApplicationService;
import com.talentflow.backend.service.AtsResumeAnalyzerService;
import com.talentflow.backend.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Job Applications & ATS", description = "Application submission, candidate application tracker, and recruiter ATS pipeline APIs")
@SecurityRequirement(name = "BearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AtsResumeAnalyzerService atsResumeAnalyzerService;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final ProfileService profileService;
    private final ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationService applicationService,
            @Lazy AtsResumeAnalyzerService atsResumeAnalyzerService,
            JobRepository jobRepository,
            ResumeRepository resumeRepository,
            ProfileService profileService,
            ApplicationRepository applicationRepository) {
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
                .body(ApiResponse.ok(
                        "Application submitted successfully. A confirmation email has been dispatched to your inbox.",
                        response));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get current candidate's submitted applications", description = "Returns all active job applications for the logged-in candidate with real-time ATS statuses.")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(Authentication authentication) {
        List<ApplicationResponse> list = applicationService
                .getCandidateApplications(getAuthenticatedEmail(authentication));
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
        ApplicationResponse updated = applicationService.updateApplicationStatus(id,
                getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(ApiResponse.ok("Applicant status updated successfully", updated));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get application status transition history", description = "Returns full chronological audit trail of all ATS status changes and recruiter remarks for an application.")
    public ResponseEntity<ApiResponse<List<ApplicationStatusHistoryResponse>>> getStatusHistory(
            @PathVariable Long id,
            Authentication authentication) {
        List<ApplicationStatusHistoryResponse> history = applicationService.getApplicationHistory(id,
                getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application history retrieved successfully", history));
    }

    @GetMapping("/{id}/ats-analysis")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get MongoDB-backed AI ATS Resume Analysis for an application", description = "Fetches the detailed keyword match, score breakdown, and recommendations stored in MongoDB.")
    public ResponseEntity<ApiResponse<AtsAnalysisDocument>> getApplicationAtsAnalysis(
            @PathVariable Long id,
            Authentication authentication) {
        if (atsResumeAnalyzerService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("ATS Resume Analyzer service is temporarily unavailable"));
        }

        AtsAnalysisDocument doc = atsResumeAnalyzerService.getAnalysisByApplicationId(id)
                .orElseGet(() -> {
                    Application app = applicationRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

                    // 1. Look for existing MongoDB ATS document created for this candidate & job
                    // (e.g. if saved with null applicationId)
                    if (app.getCandidateEmail() != null && app.getJob() != null) {
                        List<AtsAnalysisDocument> existingList = atsResumeAnalyzerService
                                .getAnalysisByCandidateEmail(app.getCandidateEmail());
                        for (AtsAnalysisDocument existing : existingList) {
                            if (existing.getJobId() != null && existing.getJobId().equals(app.getJob().getId())) {
                                existing.setApplicationId(id);
                                AtsAnalysisDocument linked = atsResumeAnalyzerService.saveAnalysis(existing);
                                if (app.getAtsScore() == null) {
                                    app.setAtsScore(linked.getAtsScore());
                                    app.setAtsMatchTier(linked.getMatchTier());
                                    applicationRepository.save(app);
                                }
                                return linked;
                            }
                        }
                    }

                    // 2. On-demand evaluation & persistence in MongoDB for legacy or existing
                    // applications
                    AtsAnalysisDocument generated = atsResumeAnalyzerService.analyzeAndSave(app, app.getJob(),
                            app.getResume());
                    if (generated != null && app.getAtsScore() == null) {
                        app.setAtsScore(generated.getAtsScore());
                        app.setAtsMatchTier(generated.getMatchTier());
                        applicationRepository.save(app);
                    }
                    return generated;
                });
        return ResponseEntity.ok(ApiResponse.ok("ATS analysis retrieved successfully", doc));
    }

    @GetMapping("/{id}/constructive-feedback")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get constructive feedback and skill gap analysis for an application", description = "Delivers positive, growth-oriented feedback with identified strengths, critical skill gaps, and recommended action steps.")
    public ResponseEntity<ApiResponse<ConstructiveFeedbackResponse>> getConstructiveFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        ConstructiveFeedbackResponse feedback = applicationService.getConstructiveFeedback(id, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Constructive feedback retrieved successfully", feedback));
    }

    @PostMapping(value = "/analyze-ats", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "AI ATS Resume Scanner & Mistakes Audit", description = "Scans a resume file (from device or saved resume) against a specific job or provides a standalone audit with ATS score, detected mistakes, and step-by-step improvements.")
    public ResponseEntity<ApiResponse<AtsAnalysisDocument>> analyzeAtsPreApplication(
            @RequestParam(value = "jobId", required = false) Long jobId,
            @RequestParam(value = "targetRole", required = false) String targetRole,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeId", required = false) Long resumeId,
            Authentication authentication) throws IOException {

        if (atsResumeAnalyzerService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("ATS Resume Analyzer service is temporarily unavailable"));
        }

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
            Optional<ResumeDocument> docOpt = profileService.getResumeDocumentBySqlId(resumeId);
            if (docOpt.isPresent()) {
                resumeText = docOpt.get().getParsedText();
                fileName = docOpt.get().getFileName();
            }
        }

        if (resumeText.isBlank() && authentication != null) {
            try {
                CandidateProfile cand = profileService.getOrCreateCandidateProfileEntity(userEmail);
                Optional<ResumeDocument> primary = profileService.getCandidatePrimaryResumeDocument(cand.getId());
                if (primary.isPresent()) {
                    resumeText = primary.get().getParsedText();
                    fileName = primary.get().getFileName();
                }
            } catch (Exception ignored) {
            }
        }

        AtsAnalysisDocument analysis;
        if (jobId != null) {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));
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
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        Optional<ResumeDocument> docOpt = Optional.empty();
        if (app.getResume() != null) {
            docOpt = profileService.getResumeDocumentBySqlId(app.getResume().getId());
        }
        if (docOpt.isEmpty() && app.getCandidateProfile() != null) {
            docOpt = profileService.getCandidatePrimaryResumeDocument(app.getCandidateProfile().getId());
        }

        ResumeDocument doc = docOpt
                .orElseThrow(() -> new ResourceNotFoundException("ResumeDocument", "applicationId", id));

        String fileName = doc.getFileName() != null ? doc.getFileName() : "Application_Resume.pdf";
        String contentType = doc.getContentType() != null ? doc.getContentType() : "application/pdf";
        byte[] bytes = doc.getFileData() != null ? doc.getFileData() : new byte[0];

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(bytes);
    }

    @PostMapping("/{id}/offer-letter/send")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Approve & Send official offer letter email with PDF", description = "Compiles the signed offer letter PDF, updates status to OFFER_RELEASED or HIRED, and dispatches the PDF and congratulatory email to candidate.")
    public ResponseEntity<ApiResponse<ApplicationResponse>> sendOfferLetter(
            @PathVariable Long id,
            @Valid @RequestBody SendOfferLetterRequest request,
            Authentication authentication) {
        String actorEmail = getAuthenticatedEmail(authentication);
        ApplicationResponse response = applicationService.sendOfferLetter(id, request, actorEmail);
        return ResponseEntity.ok(ApiResponse.ok("Offer letter generated and successfully emailed to candidate", response));
    }

    @PostMapping("/{id}/offer-letter/preview-pdf")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Preview official offer letter PDF", description = "Compiles raw PDF stream in real-time based on edited offer details for recruiter review before dispatching.")
    public ResponseEntity<byte[]> previewOfferLetterPdf(
            @PathVariable Long id,
            @RequestBody SendOfferLetterRequest request) {
        byte[] pdfBytes = applicationService.generateOfferLetterPreviewPdf(id, request);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Offer_Letter_Preview.pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/{id}/offer-letter/download")
    @Operation(summary = "Download official offer letter PDF", description = "Streams the archived official Offer Letter PDF for this candidate/recruiter.")
    public ResponseEntity<byte[]> downloadOfferLetter(@PathVariable Long id) {
        byte[] pdfBytes = applicationService.getOfferLetterPdfBytes(id);
        String fileName = "Offer_Letter_Application_" + id + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(pdfBytes);
    }

    @DeleteMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Withdraw application", description = "Allows candidate to withdraw their application at any stage except after HIRED. Permanently removes the application from both candidate and recruiter portals.")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @PathVariable Long id,
            Authentication authentication) {
        applicationService.withdrawApplication(id, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn and permanently deleted successfully.", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Delete / Withdraw application", description = "Deletes and withdraws the application.")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @PathVariable Long id,
            Authentication authentication) {
        applicationService.withdrawApplication(id, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn and permanently deleted successfully.", null));
    }
}
