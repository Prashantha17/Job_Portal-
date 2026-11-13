package com.talentflow.backend.controller;

import com.talentflow.backend.dto.HealthResponseDTO;
import com.talentflow.backend.dto.SystemInfoDTO;
import com.talentflow.backend.service.HealthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;

import java.time.Instant;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HealthService healthService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/health returns 200 OK with formatted health payload")
    void testGetHealthEndpoint() throws Exception {
        HealthResponseDTO mockHealth = HealthResponseDTO.builder()
                .status("UP")
                .applicationName("TalentFlow 360")
                .version("1.0.0-SNAPSHOT")
                .environment("dev")
                .timestamp(Instant.now())
                .uptimeSeconds(120)
                .databaseStatus("UP")
                .databaseProduct("MySQL 8.4")
                .services(Map.of("database", Map.of("status", "UP")))
                .systemInfo(SystemInfoDTO.builder()
                        .javaVersion("21")
                        .osName("Windows")
                        .availableProcessors(8)
                        .build())
                .build();

        when(healthService.checkHealth()).thenReturn(mockHealth);

        mockMvc.perform(get("/api/v1/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.databaseStatus").value("UP"))
                .andExpect(jsonPath("$.data.applicationName").value("TalentFlow 360"));
    }

    @Test
    @DisplayName("GET /api/v1/health/ping returns PONG status")
    void testPingEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health/ping")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PONG"));
    }
}
