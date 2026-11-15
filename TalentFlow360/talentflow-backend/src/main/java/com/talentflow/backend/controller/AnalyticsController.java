package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.analytics.*;
import com.talentflow.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Recruitment Analytics & Funnels", description = "Time-to-hire, 10-stage ATS conversion funnel drop-off metrics, application trends, and in-demand skills velocity")
@SecurityRequirement(name = "BearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping("/recruiter/dashboard")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get complete recruiter recruitment analytics suite",
               description = "Returns high-level KPI overview, 10-stage funnel conversions & drop-offs, application trends, skills velocity, and job performance breakdown.")
    public ResponseEntity<ApiResponse<RecruiterAnalyticsResponse>> getRecruiterDashboard(Authentication authentication) {
        RecruiterAnalyticsResponse response = analyticsService.getFullRecruiterAnalytics(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Recruitment analytics retrieved successfully", response));
    }

    @GetMapping("/recruiter/overview")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get recruiter KPI summary",
               description = "Returns Time-to-Hire, Offer Acceptance Rate, Shortlist Rate, Interview Pass Rate, and Active Pipeline count.")
    public ResponseEntity<ApiResponse<RecruiterOverviewDto>> getRecruiterOverview(Authentication authentication) {
        RecruiterOverviewDto overview = analyticsService.getOverview(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Recruiter overview metrics retrieved successfully", overview));
    }

    @GetMapping("/recruiter/funnel")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get 10-stage ATS conversion funnel",
               description = "Returns stage-by-stage candidate progression counts, conversion percentages, and drop-off rates.")
    public ResponseEntity<ApiResponse<StageFunnelDto>> getRecruiterFunnel(Authentication authentication) {
        StageFunnelDto funnel = analyticsService.getFunnel(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Recruitment funnel metrics retrieved successfully", funnel));
    }

    @GetMapping("/recruiter/trends")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get application timeline trends",
               description = "Returns time-series volume of candidate applications and successful hires.")
    public ResponseEntity<ApiResponse<List<ApplicationTrendPointDto>>> getRecruiterTrends(Authentication authentication) {
        List<ApplicationTrendPointDto> trends = analyticsService.getTrends(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Application trends retrieved successfully", trends));
    }

    @GetMapping("/recruiter/skills-velocity")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get in-demand skills velocity and talent supply",
               description = "Compares required skills in recruiter vacancies against applicant skill profiles.")
    public ResponseEntity<ApiResponse<List<SkillVelocityDto>>> getSkillVelocity(Authentication authentication) {
        List<SkillVelocityDto> skills = analyticsService.getSkillVelocity(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Skill velocity metrics retrieved successfully", skills));
    }

    @GetMapping("/recruiter/job-performance")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get job vacancy recruitment performance matrix",
               description = "Returns performance breakdown for each job vacancy posted by recruiter.")
    public ResponseEntity<ApiResponse<List<JobPerformanceMetricDto>>> getJobPerformance(Authentication authentication) {
        List<JobPerformanceMetricDto> jobs = analyticsService.getJobPerformance(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(ApiResponse.ok("Job vacancy performance metrics retrieved successfully", jobs));
    }
}

