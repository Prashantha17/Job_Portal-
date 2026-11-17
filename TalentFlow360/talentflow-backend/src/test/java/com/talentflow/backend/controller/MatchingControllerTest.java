package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.matching.CandidateMatchDto;
import com.talentflow.backend.dto.matching.JobRecommendationDto;
import com.talentflow.backend.dto.matching.MatchBreakdownDto;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.MatchingEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MatchingController.class)
@AutoConfigureMockMvc(addFilters = false)
class MatchingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MatchingEngineService matchingEngineService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UsernamePasswordAuthenticationToken candidateAuth;
    private UsernamePasswordAuthenticationToken recruiterAuth;

    @BeforeEach
    void setUp() {
        candidateAuth = new UsernamePasswordAuthenticationToken(
                "candidate@talentflow.in",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_JOB_SEEKER"))
        );

        recruiterAuth = new UsernamePasswordAuthenticationToken(
                "recruiter@techcorp.in",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );
    }

    @Test
    @DisplayName("GET /api/v1/matching/candidate/recommendations - Should return 200 OK with recommended jobs")
    void testGetCandidateRecommendations_Success() throws Exception {
        JobRecommendationDto rec = new JobRecommendationDto();
        rec.setJobId(101L);
        rec.setTitle("Lead Java Full-Stack Engineer");
        rec.setCompanyName("TechCorp India");
        rec.setMatchScore(94.5);
        rec.setMatchTier("EXCEPTIONAL_MATCH");

        MatchBreakdownDto breakdown = new MatchBreakdownDto();
        breakdown.setTotalScore(94.5);
        breakdown.setMatchTier("EXCEPTIONAL_MATCH");
        rec.setBreakdown(breakdown);

        when(matchingEngineService.getRecommendationsForCandidate(eq("candidate@talentflow.in"), anyInt()))
                .thenReturn(List.of(rec));

        mockMvc.perform(get("/api/v1/matching/candidate/recommendations")
                        .principal(candidateAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].jobId").value(101))
                .andExpect(jsonPath("$.data[0].matchScore").value(94.5))
                .andExpect(jsonPath("$.data[0].matchTier").value("EXCEPTIONAL_MATCH"));
    }

    @Test
    @DisplayName("GET /api/v1/matching/jobs/{jobId}/candidates - Should return 200 OK with ranked candidates")
    void testGetTopMatchedCandidatesForJob_Success() throws Exception {
        CandidateMatchDto match = new CandidateMatchDto();
        match.setCandidateId(501L);
        match.setCandidateName("Rohan Verma");
        match.setHeadline("Cloud Native Spring Boot Specialist");
        match.setMatchScore(91.0);
        match.setMatchTier("EXCEPTIONAL_MATCH");

        when(matchingEngineService.getTopMatchedCandidatesForJob(eq(101L), anyInt()))
                .thenReturn(List.of(match));

        mockMvc.perform(get("/api/v1/matching/jobs/101/candidates")
                        .principal(recruiterAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].candidateId").value(501))
                .andExpect(jsonPath("$.data[0].candidateName").value("Rohan Verma"))
                .andExpect(jsonPath("$.data[0].matchScore").value(91.0));
    }

    @Test
    @DisplayName("GET /api/v1/matching/jobs/{jobId}/applicants - Should return 200 OK with ranked applicants")
    void testGetJobApplicantMatches_Success() throws Exception {
        CandidateMatchDto applicantMatch = new CandidateMatchDto();
        applicantMatch.setCandidateId(601L);
        applicantMatch.setCandidateName("Sneha Patil");
        applicantMatch.setMatchScore(87.5);
        applicantMatch.setMatchTier("STRONG_MATCH");
        applicantMatch.setHasApplied(true);

        when(matchingEngineService.getJobApplicantMatches(101L))
                .thenReturn(List.of(applicantMatch));

        mockMvc.perform(get("/api/v1/matching/jobs/101/applicants")
                        .principal(recruiterAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].candidateId").value(601))
                .andExpect(jsonPath("$.data[0].hasApplied").value(true));
    }
}
