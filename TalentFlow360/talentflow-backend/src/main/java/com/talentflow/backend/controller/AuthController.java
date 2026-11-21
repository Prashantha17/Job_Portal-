package com.talentflow.backend.controller;

import com.talentflow.backend.dto.ApiResponse;
import com.talentflow.backend.dto.auth.*;
import com.talentflow.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & Access Control", description = "Endpoints for user registration, login, token refresh, and identity introspection")
public class AuthController {

    private final AuthService authService;
    private final com.talentflow.backend.service.OtpService otpService;
    private final com.talentflow.backend.service.RateLimitingService rateLimitingService;

    @org.springframework.beans.factory.annotation.Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public AuthController(AuthService authService,
                          com.talentflow.backend.service.OtpService otpService,
                          @org.springframework.beans.factory.annotation.Autowired(required = false)
                          com.talentflow.backend.service.RateLimitingService rateLimitingService) {
        this.authService = authService;
        this.otpService = otpService;
        this.rateLimitingService = rateLimitingService != null ? rateLimitingService : new com.talentflow.backend.service.RateLimitingService();
    }

    @PostMapping("/register")
    @Operation(summary = "Register new candidate or recruiter", description = "Creates a new user record with role selection, hashes password with BCrypt, and returns a JWT token.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful. Welcome to TalentFlow 360!", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User authentication (Login)", description = "Authenticates user credentials, verifies password, and returns signed JWT access & refresh tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        rateLimitingService.checkRateLimit("login:" + request.getEmail().toLowerCase().trim(), 15, 300);
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", response));
    }

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP code to email", description = "Generates a 6-digit OTP and dispatches it directly to the user's email inbox.")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        rateLimitingService.checkRateLimit("otp:" + request.getEmail().toLowerCase().trim(), 5, 300);
        otpService.generateAndSendOtp(request.getEmail(), request.getPurpose());
        return ResponseEntity.ok(ApiResponse.ok("Verification code has been sent directly to your email inbox (" + request.getEmail() + ")", "OTP_SENT"));
    }

    @GetMapping("/dev-otp")
    @Operation(summary = "Get cached dev OTP", description = "Returns cached OTP for local testing/dev environments in O(1) time.")
    public ResponseEntity<ApiResponse<String>> getDevOtp(@RequestParam String email) {
        if ("prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile)) {
            throw new com.talentflow.backend.exception.ApiException("Endpoint disabled in production environment", org.springframework.http.HttpStatus.NOT_FOUND);
        }
        String cachedOtp = otpService.getDevOtp(email);
        return ResponseEntity.ok(ApiResponse.ok("Dev OTP retrieved", cachedOtp));
    }

    @PostMapping("/login-otp")
    @Operation(summary = "Verify OTP and sign in", description = "Authenticates user using the 6-digit OTP sent to their email inbox.")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithOtp(@Valid @RequestBody VerifyOtpLoginRequest request) {
        AuthResponse response = authService.loginWithOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("OTP verified successfully. Welcome to TalentFlow 360!", response));
    }

    @PostMapping("/google")
    @Operation(summary = "Google OAuth Sign-In & Instant Registration", description = "Authenticates or registers user using Google profile credentials and returns JWT session tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok("Google authentication successful. Welcome to TalentFlow 360!", response));
    }

    @PostMapping("/forgot-password/verify")
    @Operation(summary = "Verify OTP and reset password", description = "Verifies the 6-digit OTP sent to email and updates the account password.")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resetPasswordWithOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("Your password has been successfully reset. You can now sign in with your new password.", "PASSWORD_RESET_SUCCESS"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchanges a valid refresh token for a newly issued JWT access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns identity and role permissions for the currently authenticated bearer token.")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserProfileResponse profile = authService.getCurrentUserProfile(email);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved successfully", profile));
    }
}

