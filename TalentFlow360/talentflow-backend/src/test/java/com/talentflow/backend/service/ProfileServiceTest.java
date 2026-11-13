package com.talentflow.backend.service;

import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.mapper.ProfileMapper;
import com.talentflow.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private CandidateSkillRepository candidateSkillRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private SkillService skillService;

    @Spy
    private ProfileMapper profileMapper = new ProfileMapper();

    @InjectMocks
    private ProfileService profileService;

    private User candidateUser;
    private CandidateProfile candidateProfile;

    @BeforeEach
    void setUp() {
        candidateUser = new User("candidate@talentflow360.com", "hash", "Aarav", "Sharma", "+91 98765 43210", UserStatus.ACTIVE);
        candidateUser.setId(10L);
        candidateProfile = new CandidateProfile(candidateUser);
        candidateProfile.setId(20L);
        candidateProfile.setHeadline("Full Stack Java Engineer");
    }

    @Test
    @DisplayName("getCandidateProfile returns mapped CandidateProfileResponse")
    void testGetCandidateProfile() {
        when(userRepository.findByEmail("candidate@talentflow360.com"))
                .thenReturn(Optional.of(candidateUser));
        when(candidateProfileRepository.findByUser(candidateUser))
                .thenReturn(Optional.of(candidateProfile));

        CandidateProfileResponse response = profileService.getCandidateProfile("candidate@talentflow360.com");

        assertNotNull(response);
        assertEquals("Aarav Sharma", response.getFullName());
        assertEquals("Full Stack Java Engineer", response.getHeadline());
    }

    @Test
    @DisplayName("updateCandidateProfile updates profile fields and user details")
    void testUpdateCandidateProfile() {
        when(userRepository.findByEmail("candidate@talentflow360.com"))
                .thenReturn(Optional.of(candidateUser));
        when(candidateProfileRepository.findByUser(candidateUser))
                .thenReturn(Optional.of(candidateProfile));
        when(candidateProfileRepository.save(any(CandidateProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UpdateCandidateProfileRequest req = new UpdateCandidateProfileRequest();
        req.setFirstName("Alexander");
        req.setHeadline("Principal Engineer");
        req.setLocation("Seattle, WA");

        CandidateProfileResponse response = profileService.updateCandidateProfile("candidate@talentflow360.com", req);

        assertNotNull(response);
        assertEquals("Alexander", candidateUser.getFirstName());
        assertEquals("Principal Engineer", candidateProfile.getHeadline());
        assertEquals("Seattle, WA", candidateProfile.getLocation());
    }

    @Test
    @DisplayName("addEducation persists and returns EducationDTO")
    void testAddEducation() {
        when(userRepository.findByEmail("candidate@talentflow360.com"))
                .thenReturn(Optional.of(candidateUser));
        when(candidateProfileRepository.findByUser(candidateUser))
                .thenReturn(Optional.of(candidateProfile));

        EducationDTO request = new EducationDTO(
                null, "Stanford University", "Master of Science", "Computer Science",
                "2022", "2024", "4.0 GPA", "AI & ML Specialization"
        );

        when(educationRepository.save(any(Education.class))).thenAnswer(inv -> {
            Education edu = inv.getArgument(0);
            edu.setId(101L);
            return edu;
        });

        EducationDTO saved = profileService.addEducation("candidate@talentflow360.com", request);

        assertNotNull(saved);
        assertEquals(101L, saved.getId());
        assertEquals("Stanford University", saved.getInstitution());
        assertEquals("Master of Science", saved.getDegree());
    }

    @Test
    @DisplayName("addExperience persists and returns ExperienceDTO")
    void testAddExperience() {
        when(userRepository.findByEmail("candidate@talentflow360.com"))
                .thenReturn(Optional.of(candidateUser));
        when(candidateProfileRepository.findByUser(candidateUser))
                .thenReturn(Optional.of(candidateProfile));

        ExperienceDTO request = new ExperienceDTO(
                null, "Google", "Senior Staff Engineer", "Mountain View, CA",
                "2024-01", "Present", true, "Leading cloud platform engineering"
        );

        when(experienceRepository.save(any(Experience.class))).thenAnswer(inv -> {
            Experience exp = inv.getArgument(0);
            exp.setId(201L);
            return exp;
        });

        ExperienceDTO saved = profileService.addExperience("candidate@talentflow360.com", request);

        assertNotNull(saved);
        assertEquals(201L, saved.getId());
        assertEquals("Google", saved.getCompanyName());
        assertEquals("Senior Staff Engineer", saved.getJobTitle());
    }

    @Test
    @DisplayName("getRecruiterProfile returns recruiter profile DTO")
    void testGetRecruiterProfile() {
        User recruiterUser = new User("recruiter@talentflow360.com", "hash", "Sarah", "Jenkins", "+1-555-0102", UserStatus.ACTIVE);
        recruiterUser.setId(30L);
        RecruiterProfile recruiterProfile = new RecruiterProfile(
                recruiterUser, "Apex Tech", "Talent Lead", "HR", "sarah@apex.com", "+1-555-0199", "https://linkedin.com/sarah", true
        );
        recruiterProfile.setId(40L);

        when(userRepository.findByEmail("recruiter@talentflow360.com"))
                .thenReturn(Optional.of(recruiterUser));
        when(recruiterProfileRepository.findByUser(recruiterUser))
                .thenReturn(Optional.of(recruiterProfile));

        RecruiterProfileDTO response = profileService.getRecruiterProfile("recruiter@talentflow360.com");

        assertNotNull(response);
        assertEquals("Sarah Jenkins", response.getFullName());
        assertEquals("Apex Tech", response.getCompanyName());
        assertEquals("Talent Lead", response.getDesignation());
    }
}

