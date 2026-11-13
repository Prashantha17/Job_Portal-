package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.interview.InterviewResponse;
import com.talentflow.backend.dto.interview.ScheduleInterviewRequest;
import com.talentflow.backend.dto.interview.SubmitFeedbackRequest;
import com.talentflow.backend.dto.interview.UpdateInterviewStatusRequest;
import com.talentflow.backend.service.InterviewService;
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
@RequestMapping("/api/v1/interviews")
@Tag(name = "Interview Management & Scheduling", description = "Interview scheduling, candidate confirmation, reschedule requests, evaluation scorecards, and meeting video links")
@SecurityRequirement(name = "BearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Schedule interview round & dispatch calendar invitation",
               description = "Schedules an interview round in IST, generates meeting link, updates application pipeline stage, and sends email invitations.")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(
            @Valid @RequestBody ScheduleInterviewRequest request,
            Authentication authentication) {
        InterviewResponse response = interviewService.scheduleInterview(getAuthenticatedEmail(authentication), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Interview round scheduled successfully and invitation dispatched to candidate.", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get interview details by ID", description = "Fetches complete interview schedule, meeting link, and scorecard.")
    public ResponseEntity<ApiResponse<InterviewResponse>> getInterviewById(
            @PathVariable Long id,
            Authentication authentication) {
        InterviewResponse response = interviewService.getInterviewById(id, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Interview details retrieved successfully", response));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all interview rounds for an application", description = "Returns all scheduled, completed, and past rounds for a candidate application.")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getInterviewsByApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {
        List<InterviewResponse> list = interviewService.getInterviewsByApplication(applicationId, getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application interview rounds retrieved successfully", list));
    }

    @GetMapping("/candidate/my")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all scheduled interviews for logged-in candidate",
               description = "Returns all upcoming and past interviews for the logged-in candidate with meeting links and status flags.")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getCandidateInterviews(Authentication authentication) {
        List<InterviewResponse> list = interviewService.getInterviewsForCandidate(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Candidate interview schedule retrieved successfully", list));
    }

    @GetMapping("/recruiter/my")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all scheduled interviews for logged-in recruiter",
               description = "Returns all upcoming interviews conducted by the logged-in recruiter or hiring team.")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getRecruiterInterviews(Authentication authentication) {
        List<InterviewResponse> list = interviewService.getInterviewsForRecruiter(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Recruiter interview schedule retrieved successfully", list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Confirm attendance or request rescheduling",
               description = "Updates the interview status (e.g. CONFIRMED, RESCHEDULE_REQUESTED, CANCELLED) and notifies both parties.")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateInterviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewStatusRequest request,
            Authentication authentication) {
        InterviewResponse response = interviewService.updateInterviewStatus(id, getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(ApiResponse.ok("Interview status updated successfully", response));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Submit interviewer evaluation scorecard & ratings",
               description = "Submits multi-category 5-star ratings, overall recommendation (STRONG_HIRE, HIRE, HOLD, NO_HIRE), and written remarks.")
    public ResponseEntity<ApiResponse<InterviewResponse>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody SubmitFeedbackRequest request,
            Authentication authentication) {
        InterviewResponse response = interviewService.submitFeedback(id, getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(ApiResponse.ok("Evaluation scorecard submitted and candidate status updated successfully", response));
    }
}

