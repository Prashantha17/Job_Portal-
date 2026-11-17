package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.matching.CandidateMatchDto;
import com.talentflow.backend.dto.matching.JobRecommendationDto;
import com.talentflow.backend.service.MatchingEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matching")
@Tag(name = "Smart Candidate-Job Matching & Recommendations", description = "Algorithmic 0-100% fit scoring, skill gap analysis, job recommendations for job seekers, and candidate ranking for recruiters")
@SecurityRequirement(name = "BearerAuth")
public class MatchingController {

    private final MatchingEngineService matchingEngineService;

    public MatchingController(MatchingEngineService matchingEngineService) {
        this.matchingEngineService = matchingEngineService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping("/candidate/recommendations")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'SUPER_ADMIN')")
    @Operation(summary = "Get personalized job recommendations for candidate",
               description = "Computes 0-100% match scores based on skills, experience, location, and CTC fit, returning highest matching published vacancies.")
    public ResponseEntity<ApiResponse<List<JobRecommendationDto>>> getCandidateRecommendations(
            @RequestParam(defaultValue = "15") int limit,
            Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        List<JobRecommendationDto> recommendations = matchingEngineService.getRecommendationsForCandidate(email, limit);
        return ResponseEntity.ok(ApiResponse.ok("Job recommendations retrieved successfully", recommendations));
    }

    @GetMapping("/jobs/{jobId}/candidates")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Find and rank platform candidates for a job vacancy",
               description = "Scans platform talent pool and scores all candidates against the job's required/preferred skills, experience, and budget.")
    public ResponseEntity<ApiResponse<List<CandidateMatchDto>>> getTopMatchedCandidatesForJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "20") int limit) {
        List<CandidateMatchDto> matches = matchingEngineService.getTopMatchedCandidatesForJob(jobId, limit);
        return ResponseEntity.ok(ApiResponse.ok("Top candidate matches retrieved successfully", matches));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Score and rank existing applicants of a job vacancy",
               description = "Calculates multi-dimensional match breakdowns for all candidates who submitted applications for this vacancy.")
    public ResponseEntity<ApiResponse<List<CandidateMatchDto>>> getJobApplicantMatches(
            @PathVariable Long jobId) {
        List<CandidateMatchDto> matches = matchingEngineService.getJobApplicantMatches(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Applicant match scores retrieved successfully", matches));
    }
}
