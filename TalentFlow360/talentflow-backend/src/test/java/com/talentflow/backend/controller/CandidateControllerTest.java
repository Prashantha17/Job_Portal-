package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.entity.ProficiencyLevel;
import com.talentflow.backend.entity.SkillCategory;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CandidateController.class)
@AutoConfigureMockMvc(addFilters = false)
class CandidateControllerTest {

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
                "candidate@talentflow360.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_JOB_SEEKER"))
        );
    }

    @Test
    @DisplayName("GET /api/v1/candidates/me returns 200 OK with CandidateProfileResponse")
    void testGetMyProfile() throws Exception {
        CandidateProfileResponse response = CandidateProfileResponse.builder()
                .id(1L)
                .email("candidate@talentflow360.com")
                .firstName("Aarav")
                .lastName("Sharma")
                .headline("Full Stack Java Engineer")
                .educations(List.of())
                .experiences(List.of())
                .skills(List.of())
                .resumes(List.of())
                .build();

        when(profileService.getCandidateProfile(any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/candidates/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("candidate@talentflow360.com"))
                .andExpect(jsonPath("$.headline").value("Full Stack Java Engineer"));
    }

    @Test
    @DisplayName("POST /api/v1/candidates/me/education returns 201 CREATED")
    void testAddEducation() throws Exception {
        EducationDTO request = new EducationDTO(
                null, "MIT", "Bachelor of Science", "Computer Engineering",
                "2018", "2022", "3.9 GPA", "Honors graduate"
        );
        EducationDTO created = new EducationDTO(
                10L, "MIT", "Bachelor of Science", "Computer Engineering",
                "2018", "2022", "3.9 GPA", "Honors graduate"
        );

        when(profileService.addEducation(any(), any(EducationDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/candidates/me/education")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.institution").value("MIT"));
    }

    @Test
    @DisplayName("POST /api/v1/candidates/me/skills returns 201 CREATED")
    void testAddSkill() throws Exception {
        AddSkillRequest request = new AddSkillRequest("Java", SkillCategory.BACKEND, ProficiencyLevel.EXPERT, 5.0);
        CandidateSkillDTO response = new CandidateSkillDTO(1L, 101L, "Java", SkillCategory.BACKEND, ProficiencyLevel.EXPERT, 5.0);

        when(profileService.addCandidateSkill(any(), any(AddSkillRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/candidates/me/skills")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.skillName").value("Java"))
                .andExpect(jsonPath("$.proficiencyLevel").value("EXPERT"));
    }
}
