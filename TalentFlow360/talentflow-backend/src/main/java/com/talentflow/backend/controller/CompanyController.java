package com.talentflow.backend.controller;

import com.talentflow.backend.dto.PageResponse;
import com.talentflow.backend.dto.job.CompanyDTO;
import com.talentflow.backend.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/companies")
@Tag(name = "Companies", description = "Verified employer and company management APIs")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping
    @Operation(summary = "Get verified companies directory with pagination")
    public ResponseEntity<PageResponse<CompanyDTO>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(companyService.getVerifiedCompanies(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed company profile by ID")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get current recruiter's affiliated company")
    public ResponseEntity<CompanyDTO> getMyCompany(Authentication authentication) {
        return ResponseEntity.ok(companyService.getMyCompany(getAuthenticatedEmail(authentication)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update company profile details")
    public ResponseEntity<CompanyDTO> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDTO request) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }
}

