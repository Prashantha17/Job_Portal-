package com.talentflow.backend.service;

import com.talentflow.backend.dto.analytics.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository historyRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @Mock
    private CandidateSkillRepository candidateSkillRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User recruiter;
    private Job testJob;
    private Application hiredApp;
    private Application techApp;
    private Application rejectedApp;
    private ApplicationStatusHistory hiredHistory;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setId(1L);
        recruiter.setEmail("recruiter@techcorp.in");
        recruiter.setFirstName("Priya");
        recruiter.setLastName("Sharma");

        Company company = new Company();
        company.setId(10L);
        company.setName("TechCorp India");

        testJob = new Job();
        testJob.setId(100L);
        testJob.setTitle("Lead Java Full-Stack Engineer");
        testJob.setCompany(company);
        testJob.setPostedBy(recruiter);
        testJob.setStatus(JobStatus.PUBLISHED);
        testJob.setVacanciesCount(2);
        testJob.setLocation("Bengaluru, Karnataka");
        testJob.setMinSalary(2400000.0);
        testJob.setMaxSalary(3200000.0);

        CandidateProfile candidate1 = new CandidateProfile();
        candidate1.setId(201L);

        CandidateProfile candidate2 = new CandidateProfile();
        candidate2.setId(202L);

        CandidateProfile candidate3 = new CandidateProfile();
        candidate3.setId(203L);

        Instant tenDaysAgo = Instant.now().minus(10, ChronoUnit.DAYS);
        Instant twoDaysAgo = Instant.now().minus(2, ChronoUnit.DAYS);

        hiredApp = new Application();
        hiredApp.setId(501L);
        hiredApp.setJob(testJob);
        hiredApp.setCandidateProfile(candidate1);
        hiredApp.setStatus(ApplicationStatus.HIRED);
        hiredApp.setAppliedAt(tenDaysAgo);
        hiredApp.setUpdatedAt(twoDaysAgo);

        hiredHistory = new ApplicationStatusHistory(hiredApp, ApplicationStatus.OFFER_RELEASED, ApplicationStatus.HIRED, "recruiter@techcorp.in", "Offer Accepted");
        hiredHistory.setChangedAt(twoDaysAgo);

        techApp = new Application();
        techApp.setId(502L);
        techApp.setJob(testJob);
        techApp.setCandidateProfile(candidate2);
        techApp.setStatus(ApplicationStatus.TECH_INTERVIEW);
        techApp.setAppliedAt(Instant.now().minus(5, ChronoUnit.DAYS));

        rejectedApp = new Application();
        rejectedApp.setId(503L);
        rejectedApp.setJob(testJob);
        rejectedApp.setCandidateProfile(candidate3);
        rejectedApp.setStatus(ApplicationStatus.REJECTED);
        rejectedApp.setAppliedAt(Instant.now().minus(7, ChronoUnit.DAYS));
    }

    @Test
    @DisplayName("Should return full recruiter analytics response when data exists")
    void testGetFullRecruiterAnalytics_Success() {
        when(userRepository.findByEmail("recruiter@techcorp.in")).thenReturn(Optional.of(recruiter));
        when(jobRepository.findByPostedByOrderByCreatedAtDesc(recruiter)).thenReturn(List.of(testJob));
        when(applicationRepository.findByRecruiterId(recruiter.getId())).thenReturn(List.of(hiredApp, techApp, rejectedApp));
        when(historyRepository.findByApplicationIdIn(anyList())).thenReturn(List.of(hiredHistory));

        Interview interview = new Interview();
        interview.setId(901L);
        interview.setJob(testJob);
        interview.setRecruiter(recruiter);
        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setRecommendation(RecommendationType.STRONG_HIRE);
        when(interviewRepository.findByRecruiterIdOrderByScheduledStartTimeDesc(recruiter.getId())).thenReturn(List.of(interview));

        Object[] demandRow = new Object[]{"Spring Boot", 2L};
        Object[] supplyRow = new Object[]{"Spring Boot", 3L};
        List<Object[]> demandList = new ArrayList<>();
        demandList.add(demandRow);
        List<Object[]> supplyList = new ArrayList<>();
        supplyList.add(supplyRow);

        when(jobSkillRepository.countSkillDemandForRecruiter(recruiter.getId())).thenReturn(demandList);
        when(candidateSkillRepository.countApplicantSkillSupplyForRecruiter(recruiter.getId())).thenReturn(supplyList);

        RecruiterAnalyticsResponse response = analyticsService.getFullRecruiterAnalytics("recruiter@techcorp.in");

        assertNotNull(response);

        // Overview Assertions
        RecruiterOverviewDto overview = response.getOverview();
        assertNotNull(overview);
        assertEquals(1, overview.getTotalJobs());
        assertEquals(1, overview.getActiveJobs());
        assertEquals(2, overview.getTotalVacancies());
        assertEquals(3, overview.getTotalApplications());
        assertEquals(1, overview.getHiredCount());
        assertEquals(1, overview.getRejectedCount());
        assertEquals(1, overview.getActiveCandidatesInPipeline()); // techApp is active
        assertEquals(100.0, overview.getInterviewPassRate()); // 1 completed, 1 passed
        assertTrue(overview.getAvgTimeToHireDays() > 0, "Time to hire should be positive");

        // Funnel Assertions
        StageFunnelDto funnel = response.getFunnel();
        assertNotNull(funnel);
        assertEquals(3, funnel.getTotalApplications());
        assertFalse(funnel.getStages().isEmpty());

        // Skills Velocity Assertions
        assertFalse(response.getSkillsVelocity().isEmpty());
        assertEquals("Spring Boot", response.getSkillsVelocity().get(0).getSkillName());

        // Job Performance Assertions
        assertEquals(1, response.getJobPerformance().size());
        assertEquals("Lead Java Full-Stack Engineer", response.getJobPerformance().get(0).getTitle());
        assertEquals(3, response.getJobPerformance().get(0).getTotalApplicants());
        assertEquals(1, response.getJobPerformance().get(0).getHiredCount());
    }

    @Test
    @DisplayName("Should handle empty recruiter portfolio safely without division by zero")
    void testEmptyData_SafeFallbacks() {
        when(userRepository.findByEmail("recruiter@techcorp.in")).thenReturn(Optional.of(recruiter));
        when(jobRepository.findByPostedByOrderByCreatedAtDesc(recruiter)).thenReturn(Collections.emptyList());
        when(applicationRepository.findByRecruiterId(recruiter.getId())).thenReturn(Collections.emptyList());
        when(interviewRepository.findByRecruiterIdOrderByScheduledStartTimeDesc(recruiter.getId())).thenReturn(Collections.emptyList());

        RecruiterAnalyticsResponse response = analyticsService.getFullRecruiterAnalytics("recruiter@techcorp.in");

        assertNotNull(response);
        RecruiterOverviewDto overview = response.getOverview();
        assertEquals(0, overview.getTotalJobs());
        assertEquals(0, overview.getTotalApplications());
        assertEquals(0.0, overview.getAvgTimeToHireDays());
        assertEquals(0.0, overview.getOfferAcceptanceRate());
        assertEquals(0.0, overview.getShortlistRate());
        assertEquals(0.0, overview.getInterviewPassRate());
        assertEquals(0, overview.getActiveCandidatesInPipeline());

        StageFunnelDto funnel = response.getFunnel();
        assertEquals(0, funnel.getTotalApplications());
        assertEquals(0, funnel.getRejectedCount());

        assertTrue(response.getJobPerformance().isEmpty());
    }

    @Test
    @DisplayName("Should calculate conversion and drop-off rates accurately in stage funnel")
    void testFunnel_DropOffRates() {
        when(userRepository.findByEmail("recruiter@techcorp.in")).thenReturn(Optional.of(recruiter));
        when(applicationRepository.findByRecruiterId(recruiter.getId())).thenReturn(List.of(hiredApp, techApp, rejectedApp));
        when(historyRepository.findByApplicationIdIn(anyList())).thenReturn(List.of(hiredHistory));

        StageFunnelDto funnel = analyticsService.getFunnel("recruiter@techcorp.in");

        assertNotNull(funnel);
        assertEquals(3, funnel.getTotalApplications());
        assertEquals(1, funnel.getRejectedCount());

        List<FunnelStageMetricDto> stages = funnel.getStages();
        // Stage 0: Applied (all 3 candidates)
        assertEquals(3, stages.get(0).getCount());
        assertEquals(100.0, stages.get(0).getConversionPercentage());
        assertEquals(0.0, stages.get(0).getDropOffRate());

        // Stage 7: Hired (hiredApp only = 1)
        FunnelStageMetricDto hiredStage = stages.get(stages.size() - 1);
        assertEquals(1, hiredStage.getCount());
        assertEquals(33.3, hiredStage.getConversionPercentage());
    }
}
