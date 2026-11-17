package com.talentflow.backend.service;

import com.talentflow.backend.dto.matching.CandidateMatchDto;
import com.talentflow.backend.dto.matching.JobRecommendationDto;
import com.talentflow.backend.dto.matching.MatchBreakdownDto;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.repository.ApplicationRepository;
import com.talentflow.backend.repository.CandidateProfileRepository;
import com.talentflow.backend.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingEngineServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private MatchingEngineService matchingEngineService;

    private CandidateProfile candidate;
    private Job job;
    private Skill javaSkill;
    private Skill reactSkill;
    private Skill dockerSkill;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(101L);
        user.setEmail("arun.kumar@example.com");
        user.setFirstName("Arun");
        user.setLastName("Kumar");
        user.setPhone("+919876543210");

        candidate = new CandidateProfile(user);
        candidate.setId(201L);
        candidate.setHeadline("Full Stack Java & React Engineer");
        candidate.setLocation("Bengaluru, Karnataka");
        candidate.setTotalExperienceYears(4.0);
        candidate.setCurrentSalary(1800000.0); // 18 LPA
        candidate.setExpectedSalary(2200000.0); // 22 LPA

        javaSkill = new Skill("Java", SkillCategory.BACKEND);
        reactSkill = new Skill("React", SkillCategory.FRONTEND);
        dockerSkill = new Skill("Docker", SkillCategory.DEVOPS);

        CandidateSkill csJava = new CandidateSkill(candidate, javaSkill, ProficiencyLevel.ADVANCED, 4.0);
        CandidateSkill csReact = new CandidateSkill(candidate, reactSkill, ProficiencyLevel.INTERMEDIATE, 3.0);
        candidate.setSkills(new ArrayList<>(List.of(csJava, csReact)));

        Company company = new Company();
        company.setId(1L);
        company.setName("FinTech Labs");

        job = new Job();
        job.setId(301L);
        job.setTitle("Senior Full Stack Developer");
        job.setCompany(company);
        job.setLocation("Bengaluru, Karnataka");
        job.setWorkplaceType(WorkplaceType.HYBRID);
        job.setEmploymentType(EmploymentType.FULL_TIME);
        job.setMinSalary(2000000.0); // 20 LPA
        job.setMaxSalary(2600000.0); // 26 LPA
        job.setExperienceYearsMin(3);
        job.setStatus(JobStatus.PUBLISHED);

        JobSkill jsJava = new JobSkill(job, javaSkill, SkillRequirementLevel.REQUIRED, 3.0);
        JobSkill jsReact = new JobSkill(job, reactSkill, SkillRequirementLevel.REQUIRED, 2.0);
        JobSkill jsDocker = new JobSkill(job, dockerSkill, SkillRequirementLevel.PREFERRED, 1.0);
        job.setJobSkills(new ArrayList<>(List.of(jsJava, jsReact, jsDocker)));
    }

    @Test
    @DisplayName("Should calculate strong/exceptional match score when candidate meets all requirements")
    void testCalculateMatch_HighFit() {
        MatchBreakdownDto breakdown = matchingEngineService.calculateMatch(candidate, job);

        assertNotNull(breakdown);
        assertTrue(breakdown.getTotalScore() >= 80.0, "Total score should be >= 80.0 for high fit, got: " + breakdown.getTotalScore());
        assertEquals("STRONG_MATCH", breakdown.getMatchTier());

        // Skills checks: 2 required matched, 0 missing required, 1 missing preferred
        assertEquals(2, breakdown.getMatchedRequiredSkills().size());
        assertTrue(breakdown.getMissingRequiredSkills().isEmpty());
        assertEquals(1, breakdown.getMissingPreferredSkills().size()); // Docker missing

        // Experience & Location & Salary
        assertEquals(20.0, breakdown.getExperienceScore()); // 4 yrs exceeds 3 yrs
        assertEquals(15.0, breakdown.getLocationScore());   // Bengaluru matches Bengaluru
        assertEquals(15.0, breakdown.getSalaryScore());     // 22 LPA fits within 20 - 26 LPA
    }

    @Test
    @DisplayName("Should calculate lower score when candidate lacks required skills and experience")
    void testCalculateMatch_LowFit() {
        CandidateProfile juniorCandidate = new CandidateProfile();
        juniorCandidate.setId(202L);
        juniorCandidate.setLocation("Chennai, Tamil Nadu");
        juniorCandidate.setTotalExperienceYears(1.0);
        juniorCandidate.setExpectedSalary(3500000.0); // 35 LPA (drastically exceeds 26 LPA max)
        juniorCandidate.setSkills(Collections.emptyList());

        MatchBreakdownDto breakdown = matchingEngineService.calculateMatch(juniorCandidate, job);

        assertNotNull(breakdown);
        assertTrue(breakdown.getTotalScore() < 50.0, "Score should be < 50 for poor fit, got: " + breakdown.getTotalScore());
        assertEquals(2, breakdown.getMissingRequiredSkills().size());
        assertTrue(breakdown.getMatchedRequiredSkills().isEmpty());
        assertTrue(breakdown.getExperienceScore() < 10.0);
    }

    @Test
    @DisplayName("Should award full 15 location points for 100% remote positions")
    void testCalculateMatch_RemotePosition() {
        job.setWorkplaceType(WorkplaceType.REMOTE);
        candidate.setLocation("Kochi, Kerala");

        MatchBreakdownDto breakdown = matchingEngineService.calculateMatch(candidate, job);

        assertEquals(15.0, breakdown.getLocationScore());
        assertTrue(breakdown.getLocationSummary().contains("Remote"));
    }

    @Test
    @DisplayName("Should return recommendations sorted by match score descending")
    void testGetRecommendationsForCandidate_Sorted() {
        Job job2 = new Job();
        job2.setId(302L);
        job2.setTitle("Python Data Engineer");
        job2.setStatus(JobStatus.PUBLISHED);
        job2.setWorkplaceType(WorkplaceType.ON_SITE);
        job2.setLocation("Delhi");
        job2.setExperienceYearsMin(8);
        job2.setJobSkills(Collections.emptyList());

        when(candidateProfileRepository.findByUserEmailWithSkills("arun.kumar@example.com")).thenReturn(Optional.of(candidate));
        when(jobRepository.findByStatusWithSkills(JobStatus.PUBLISHED)).thenReturn(List.of(job2, job));
        when(applicationRepository.findByCandidateProfileUserEmailOrderByAppliedAtDesc("arun.kumar@example.com")).thenReturn(Collections.emptyList());

        List<JobRecommendationDto> recommendations = matchingEngineService.getRecommendationsForCandidate("arun.kumar@example.com", 10);

        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());
        // The first recommended job should be job 301 (Senior Full Stack Developer) because Arun is a full stack dev
        assertEquals(301L, recommendations.get(0).getJobId());
        assertTrue(recommendations.get(0).getMatchScore() > recommendations.get(1).getMatchScore());
    }

    @Test
    @DisplayName("Should return top matched candidates for a job sorted descending")
    void testGetTopMatchedCandidatesForJob_Sorted() {
        CandidateProfile lowCandidate = new CandidateProfile();
        lowCandidate.setId(205L);
        lowCandidate.setLocation("Jaipur");
        lowCandidate.setTotalExperienceYears(0.5);
        lowCandidate.setSkills(Collections.emptyList());

        when(jobRepository.findByIdWithDetails(301L)).thenReturn(Optional.of(job));
        when(candidateProfileRepository.findAllWithSkills()).thenReturn(List.of(lowCandidate, candidate));
        when(applicationRepository.findByJobIdOrderByAppliedAtDesc(301L)).thenReturn(Collections.emptyList());

        List<CandidateMatchDto> matches = matchingEngineService.getTopMatchedCandidatesForJob(301L, 10);

        assertNotNull(matches);
        assertEquals(2, matches.size());
        // Top candidate must be Arun (201L)
        assertEquals(201L, matches.get(0).getCandidateId());
        assertTrue(matches.get(0).getMatchScore() > matches.get(1).getMatchScore());
    }
}
