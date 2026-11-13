package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.application.ApplicationResponse;
import com.talentflow.backend.dto.application.ApplicationStatusHistoryResponse;
import com.talentflow.backend.dto.application.ApplyJobRequest;
import com.talentflow.backend.dto.application.UpdateApplicationStatusRequest;
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

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
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
}

