package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.profile.RecruiterProfileDTO;
import com.talentflow.backend.dto.profile.UpdateRecruiterProfileRequest;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.ProfileService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecruiterController.class)
@AutoConfigureMockMvc(addFilters = false)
class RecruiterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfileService profileService;

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
                "recruiter@talentflow360.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );
    }

    @Test
    @DisplayName("GET /api/v1/recruiters/me returns 200 OK with RecruiterProfileDTO")
    void testGetMyProfile() throws Exception {
        RecruiterProfileDTO response = RecruiterProfileDTO.builder()
                .id(1L)
                .email("recruiter@talentflow360.com")
                .fullName("Sarah Jenkins")
                .companyName("Apex Global Technologies")
                .designation("Senior Talent Partner")
                .isVerified(true)
                .build();

        when(profileService.getRecruiterProfile(any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/recruiters/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Apex Global Technologies"))
                .andExpect(jsonPath("$.designation").value("Senior Talent Partner"));
    }

    @Test
    @DisplayName("PUT /api/v1/recruiters/me updates and returns 200 OK")
    void testUpdateMyProfile() throws Exception {
        UpdateRecruiterProfileRequest request = new UpdateRecruiterProfileRequest(
                "Apex Global Technologies",
                "Director of Talent",
                "Talent Acquisition",
                "sarah.jenkins@apex.com",
                "+1-555-0199",
                "https://linkedin.com/in/sarahjenkins"
        );

        RecruiterProfileDTO response = RecruiterProfileDTO.builder()
                .id(1L)
                .email("recruiter@talentflow360.com")
                .companyName("Apex Global Technologies")
                .designation("Director of Talent")
                .build();

        when(profileService.updateRecruiterProfile(any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/v1/recruiters/me")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.designation").value("Director of Talent"));
    }
}
