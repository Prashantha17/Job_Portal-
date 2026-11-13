package com.talentflow.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentflow.backend.dto.PageResponse;
import com.talentflow.backend.dto.job.CompanyDTO;
import com.talentflow.backend.security.JwtAuthenticationFilter;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsServiceImpl;
import com.talentflow.backend.service.CompanyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CompanyController.class)
@AutoConfigureMockMvc(addFilters = false)
class CompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CompanyService companyService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/companies - Should return paginated verified companies")
    void testGetCompanies() throws Exception {
        CompanyDTO company = new CompanyDTO();
        company.setId(1L);
        company.setName("Apex Global Technologies");
        company.setIndustry("Software & Internet");
        company.setVerified(true);

        PageResponse<CompanyDTO> pageResponse = new PageResponse<>(List.of(company), 0, 12, 1, 1, true, true);
        when(companyService.getVerifiedCompanies(any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Apex Global Technologies"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/companies/{id} - Should return company details by ID")
    void testGetCompanyById() throws Exception {
        CompanyDTO company = new CompanyDTO();
        company.setId(1L);
        company.setName("Apex Global Technologies");
        company.setHeadquarters("San Francisco, CA");

        when(companyService.getCompanyById(1L)).thenReturn(company);

        mockMvc.perform(get("/api/v1/companies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Apex Global Technologies"))
                .andExpect(jsonPath("$.headquarters").value("San Francisco, CA"));
    }

    @Test
    @DisplayName("GET /api/v1/companies/me - Should return recruiter's company")
    void testGetMyCompany() throws Exception {
        CompanyDTO company = new CompanyDTO();
        company.setId(1L);
        company.setName("Apex Global Technologies");

        when(companyService.getMyCompany("recruiter@talentflow360.com")).thenReturn(company);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "recruiter@talentflow360.com", null, List.of(new SimpleGrantedAuthority("ROLE_RECRUITER"))
        );

        mockMvc.perform(get("/api/v1/companies/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apex Global Technologies"));
    }
}

