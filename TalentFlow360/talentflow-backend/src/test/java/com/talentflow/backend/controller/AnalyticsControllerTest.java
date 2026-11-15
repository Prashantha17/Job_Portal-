package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.analytics.*;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.AnalyticsService;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AnalyticsService analyticsService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        auth = new UsernamePasswordAuthenticationToken(
                "recruiter@talentflow.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );
    }

    @Test
    @DisplayName("GET /api/v1/analytics/recruiter/dashboard - Should return 200 OK with analytics data")
    void testGetRecruiterDashboard_Success() throws Exception {
        RecruiterOverviewDto overview = new RecruiterOverviewDto(
                5, 3, 8, 42, 16.5, 90.0, 45.0, 70.0, 12, 4, 15
        );
        StageFunnelDto funnel = new StageFunnelDto(42, Collections.emptyList(), 15, 2);
        RecruiterAnalyticsResponse mockResponse = new RecruiterAnalyticsResponse(
                overview, funnel, Collections.emptyList(), Collections.emptyList(), Collections.emptyList()
        );

        when(analyticsService.getFullRecruiterAnalytics(anyString())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/analytics/recruiter/dashboard")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.overview.totalJobs").value(5))
                .andExpect(jsonPath("$.data.overview.avgTimeToHireDays").value(16.5))
                .andExpect(jsonPath("$.data.funnel.totalApplications").value(42));
    }

    @Test
    @DisplayName("GET /api/v1/analytics/recruiter/overview - Should return 200 OK")
    void testGetRecruiterOverview_Success() throws Exception {
        RecruiterOverviewDto overview = new RecruiterOverviewDto(
                5, 3, 8, 42, 16.5, 90.0, 45.0, 70.0, 12, 4, 15
        );

        when(analyticsService.getOverview(anyString())).thenReturn(overview);

        mockMvc.perform(get("/api/v1/analytics/recruiter/overview")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalJobs").value(5));
    }
}

