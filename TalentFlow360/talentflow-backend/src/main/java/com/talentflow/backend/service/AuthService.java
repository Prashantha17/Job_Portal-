package com.talentflow.backend.service;

import com.talentflow.backend.dto.auth.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ApiException;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.RefreshTokenRepository;
import com.talentflow.backend.repository.RoleRepository;
import com.talentflow.backend.repository.UserRepository;
import com.talentflow.backend.security.JwtTokenProvider;
import com.talentflow.backend.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final OtpService otpService;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.otpService = otpService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("An account with email " + normalizedEmail + " already exists", HttpStatus.CONFLICT);
        }

        // Verify Registration Email OTP
        if (request.getOtp() == null || request.getOtp().trim().isBlank()) {
            throw new ApiException("Email verification code is required. Please check your inbox for the 6-digit OTP.", HttpStatus.BAD_REQUEST);
        }
        otpService.verifyOtp(normalizedEmail, request.getOtp().trim(), OtpPurpose.REGISTRATION);

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setStatus(UserStatus.ACTIVE);

        Set<Role> roles = new HashSet<>();
        RoleType targetRole = RoleType.ROLE_JOB_SEEKER;
        if (request.getRole() != null) {
            String roleUpper = request.getRole().toUpperCase().trim();
            if (roleUpper.contains("RECRUITER") || roleUpper.equals("EMPLOYER")) {
                targetRole = RoleType.ROLE_RECRUITER;
            } else if (roleUpper.contains("HR")) {
                targetRole = RoleType.ROLE_HR_MANAGER;
            }
        }

        final RoleType finalTargetRole = targetRole;
        Role userRole = roleRepository.findByName(finalTargetRole)
                .orElseThrow(() -> new ApiException("System role not initialized: " + finalTargetRole));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        log.info("Registered new user with ID {} and role {}", savedUser.getId(), finalTargetRole);

        // Authenticate the newly registered user
        UserDetailsImpl userDetails = UserDetailsImpl.build(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(savedUser);

        List<String> roleNames = savedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .roles(roleNames)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ApiException("Your account has been suspended. Please contact platform administration.", HttpStatus.FORBIDDEN);
        }

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        log.info("User {} logged in successfully with roles {}", normalizedEmail, roles);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .roles(roles)
                .build();
    }

    @Transactional
    public AuthResponse loginWithOtp(VerifyOtpLoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // 1. Verify OTP
        otpService.verifyOtp(normalizedEmail, request.getOtp(), OtpPurpose.LOGIN);

        // 2. Get or auto-provision user
        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            log.info("Auto-provisioning new Candidate account for verified email: {}", normalizedEmail);
            User newUser = new User();
            newUser.setEmail(normalizedEmail);
            newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            String localPart = normalizedEmail.split("@")[0];
            String firstName = localPart.length() > 0
                    ? Character.toUpperCase(localPart.charAt(0)) + (localPart.length() > 1 ? localPart.substring(1) : "")
                    : "Candidate";
            newUser.setFirstName(firstName);
            newUser.setLastName("User");
            newUser.setStatus(UserStatus.ACTIVE);

            Role role = roleRepository.findByName(RoleType.ROLE_JOB_SEEKER)
                    .orElseThrow(() -> new ApiException("System role not initialized: ROLE_JOB_SEEKER"));
            newUser.setRoles(Set.of(role));
            return userRepository.save(newUser);
        });

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ApiException("Your account has been suspended. Please contact platform administration.", HttpStatus.FORBIDDEN);
        }

        // 3. Establish security context & issue JWT
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        log.info("User {} logged in successfully via OTP with roles {}", normalizedEmail, roles);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        log.info("Processing Google OAuth login for: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        // Security assertion: Prevent unauthorized Google account takeover of platform administrators
        if (user != null && user.getRoles() != null &&
                user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_SUPER_ADMIN)) {
            throw new ApiException("Direct Google login is disabled for administrative accounts. Please authenticate with enterprise credentials.", HttpStatus.FORBIDDEN);
        }

        if (user == null) {
            // Automatically register new Google user
            user = new User();
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setFirstName(request.getFirstName() != null && !request.getFirstName().isBlank() ? request.getFirstName().trim() : "Google");
            user.setLastName(request.getLastName() != null && !request.getLastName().isBlank() ? request.getLastName().trim() : "Member");
            user.setStatus(UserStatus.ACTIVE);

            Set<Role> roles = new HashSet<>();
            RoleType targetRole = RoleType.ROLE_JOB_SEEKER;
            if (request.getRole() != null) {
                String r = request.getRole().toUpperCase().trim();
                if (r.contains("RECRUITER") || r.contains("EMPLOYER")) {
                    targetRole = RoleType.ROLE_RECRUITER;
                } else if (r.contains("HR")) {
                    targetRole = RoleType.ROLE_HR_MANAGER;
                }
            }

            final RoleType finalTargetRole = targetRole;
            Role role = roleRepository.findByName(finalTargetRole)
                    .orElseThrow(() -> new ApiException("System role not initialized: " + finalTargetRole));
            roles.add(role);
            user.setRoles(roles);

            user = userRepository.save(user);
            log.info("Registered new user via Google OAuth: ID {}, Email {}, Role {}", user.getId(), user.getEmail(), targetRole);
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ApiException("Your account has been suspended. Please contact platform administration.", HttpStatus.FORBIDDEN);
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        log.info("User {} authenticated successfully via Google OAuth with roles {}", normalizedEmail, roles);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .build();
    }

    @Transactional
    public void resetPasswordWithOtp(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // 1. Verify OTP
        otpService.verifyOtp(normalizedEmail, request.getOtp(), OtpPurpose.FORGOT_PASSWORD);

        // 2. Find User
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));

        // 3. Update Password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password successfully updated via OTP for user {}", normalizedEmail);
    }

    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new ApiException("Refresh token not found", HttpStatus.UNAUTHORIZED));

        if (refreshToken.isRevoked()) {
            throw new ApiException("Refresh token has been revoked. Please sign in again.", HttpStatus.UNAUTHORIZED);
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException("Refresh token has expired. Please sign in again.", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        String newAccessToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), roles);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(jwtTokenProvider.getExpirationMs())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(() -> {
                    RefreshToken token = new RefreshToken();
                    token.setUser(user);
                    return token;
                });

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }
}
