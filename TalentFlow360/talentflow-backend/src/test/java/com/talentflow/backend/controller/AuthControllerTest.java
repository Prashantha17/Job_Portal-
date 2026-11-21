package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.auth.AuthResponse;
import com.talentflow.backend.dto.auth.LoginRequest;
import com.talentflow.backend.dto.auth.RegisterRequest;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.talentflow.backend.service.OtpService otpService;

    @MockitoBean
    private com.talentflow.backend.service.RateLimitingService rateLimitingService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/v1/auth/register creates user and returns 201 CREATED with AuthResponse")
    void testRegisterEndpoint() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "candidate@talentflow360.com",
                "Password@123",
                "Aarav",
                "Sharma",
                "+91 98765 43210",
                "JOB_SEEKER"
        );

        AuthResponse mockResponse = AuthResponse.builder()
                .accessToken("mock.jwt.access.token")
                .refreshToken("mock-refresh-token-uuid")
                .expiresInMs(86400000)
                .userId(1L)
                .email("candidate@talentflow360.com")
                .firstName("Aarav")
                .lastName("Sharma")
                .roles(List.of("ROLE_JOB_SEEKER"))
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.access.token"))
                .andExpect(jsonPath("$.data.email").value("candidate@talentflow360.com"))
                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_JOB_SEEKER"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login validates credentials and returns 200 OK")
    void testLoginEndpoint() throws Exception {
        LoginRequest request = new LoginRequest("candidate@talentflow360.com", "Password@123");

        AuthResponse mockResponse = AuthResponse.builder()
                .accessToken("mock.jwt.access.token")
                .refreshToken("mock-refresh-token-uuid")
                .expiresInMs(86400000)
                .userId(1L)
                .email("candidate@talentflow360.com")
                .firstName("Alex")
                .lastName("Morgan")
                .roles(List.of("ROLE_JOB_SEEKER"))
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.access.token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login returns 400 Bad Request when email is invalid")
    void testLoginValidationFailure() throws Exception {
        LoginRequest invalidRequest = new LoginRequest("not-an-email", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}

