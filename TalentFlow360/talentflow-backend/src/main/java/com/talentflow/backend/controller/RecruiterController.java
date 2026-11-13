package com.talentflow.backend.controller;

import com.talentflow.backend.dto.profile.RecruiterProfileDTO;
import com.talentflow.backend.dto.profile.UpdateRecruiterProfileRequest;
import com.talentflow.backend.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiters")
@Tag(name = "Recruiter Profile", description = "Recruiter profile and company affiliation management APIs")
@SecurityRequirement(name = "BearerAuth")
public class RecruiterController {

    private final ProfileService profileService;

    public RecruiterController(ProfileService profileService) {
        this.profileService = profileService;
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        return authentication.getName();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get current recruiter's profile information")
    public ResponseEntity<RecruiterProfileDTO> getMyProfile(Authentication authentication) {
        RecruiterProfileDTO profile = profileService.getRecruiterProfile(getAuthenticatedEmail(authentication));
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('RECRUITER', 'HR_MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update current recruiter's profile information")
    public ResponseEntity<RecruiterProfileDTO> updateMyProfile(
            @Valid @RequestBody UpdateRecruiterProfileRequest request,
            Authentication authentication) {
        RecruiterProfileDTO updated = profileService.updateRecruiterProfile(getAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(updated);
    }
}
