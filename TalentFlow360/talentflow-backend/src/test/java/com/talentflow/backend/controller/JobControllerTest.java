package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.PageResponse;
import com.talentflow.backend.dto.job.*;
import com.talentflow.backend.entity.EmploymentType;
import com.talentflow.backend.entity.JobStatus;
import com.talentflow.backend.entity.WorkplaceType;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.JobService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JobService jobService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/jobs - Should return paginated jobs list")
    void testSearchJobs() throws Exception {
        JobSummaryResponse summary = new JobSummaryResponse();
        summary.setId(10L);
        summary.setTitle("Senior Full Stack Java Engineer");
        summary.setCompanyName("Apex Global Technologies");
        summary.setLocation("San Francisco, CA");
        summary.setWorkplaceType(WorkplaceType.HYBRID);
        summary.setEmploymentType(EmploymentType.FULL_TIME);
        summary.setMinSalary(135000.0);
        summary.setMaxSalary(165000.0);
        summary.setStatus(JobStatus.PUBLISHED);

        PageResponse<JobSummaryResponse> page = new PageResponse<>(List.of(summary), 0, 10, 1, 1, true, true);
        when(jobService.searchJobs(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Senior Full Stack Java Engineer"))
                .andExpect(jsonPath("$.content[0].companyName").value("Apex Global Technologies"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/{id} - Should return job details")
    void testGetJobById() throws Exception {
        JobResponse response = new JobResponse();
        response.setId(10L);
        response.setTitle("Senior Full Stack Java Engineer");
        response.setCompanyName("Apex Global Technologies");
        response.setDescription("Detailed description of role");

        when(jobService.getJobById(10L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/jobs/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Senior Full Stack Java Engineer"));
    }

    @Test
    @DisplayName("POST /api/v1/jobs - Should create new job vacancy")
    void testCreateJob() throws Exception {
        CreateJobRequest req = new CreateJobRequest();
        req.setTitle("Lead Frontend Architect");
        req.setDescription("Lead our frontend architecture");
        req.setLocation("Remote");
        req.setWorkplaceType(WorkplaceType.REMOTE);
        req.setEmploymentType(EmploymentType.FULL_TIME);

        JobResponse created = new JobResponse();
        created.setId(11L);
        created.setTitle("Lead Frontend Architect");

        when(jobService.createJob(eq("recruiter@talentflow360.com"), any(CreateJobRequest.class)))
                .thenReturn(created);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "recruiter@talentflow360.com", null, List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );

        mockMvc.perform(post("/api/v1/jobs")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.title").value("Lead Frontend Architect"));
    }

    @Test
    @DisplayName("DELETE /api/v1/jobs/{id} - Should delete job vacancy")
    void testDeleteJob() throws Exception {
        doNothing().when(jobService).deleteJob("recruiter@talentflow360.com", 10L);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "recruiter@talentflow360.com", null, List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );

        mockMvc.perform(delete("/api/v1/jobs/10").principal(auth))
                .andExpect(status().isNoContent());
    }
}

