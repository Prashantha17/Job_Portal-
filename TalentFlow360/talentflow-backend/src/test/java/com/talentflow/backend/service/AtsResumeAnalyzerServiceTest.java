package com.talentflow.backend.service;

import com.talentflow.backend.document.AtsAnalysisDocument;
import com.talentflow.backend.mongorepository.AtsAnalysisDocumentRepository;
import com.talentflow.backend.mongorepository.ResumeDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class AtsResumeAnalyzerServiceTest {

    private AtsResumeAnalyzerService analyzerService;

    @BeforeEach
    void setUp() {
        AtsAnalysisDocumentRepository atsRepo = Mockito.mock(AtsAnalysisDocumentRepository.class);
        ResumeDocumentRepository resumeRepo = Mockito.mock(ResumeDocumentRepository.class);
        analyzerService = new AtsResumeAnalyzerService(atsRepo, resumeRepo);
    }

    @Test
    void testPinToPinDifferentiatedAnalysis() {
        // Resume 1: Junior resume with passive voice and zero metrics
        String weakResume = """
                Rahul Sharma
                Email: rahul.sharma@example.com
                
                Work Experience:
                Software Developer at Infosys (2023 - 2024)
                • Responsible for developing login screen and forms using React and JavaScript.
                • Worked on bug fixing and resolving user complaints in database.
                • Assisted with team meetings and sprint tracking.
                
                Skills:
                React, JavaScript, HTML, CSS
                
                Education:
                BCA in Computer Science from Bangalore University
                """;

        // Resume 2: Senior engineer with metrics and power verbs
        String strongResume = """
                Dr. Priya Deshmukh
                priya.deshmukh@techcorp.io | +91 9876543210
                linkedin.com/in/priyadeshmukh | github.com/priyadeshmukh
                
                Professional Summary:
                Senior Full Stack Architect with 6+ years of distributed systems engineering across cloud-native microservices.
                
                Professional Experience:
                Lead Systems Engineer at GlobalTech (2020 - 2024)
                • Architected scalable RESTful microservices using Java and Spring Boot, serving 120,000+ daily active users.
                • Optimized database query caching in Redis and PostgreSQL, reducing API latency by 45% from 420ms to 230ms.
                • Automated continuous integration and deployment pipelines using Docker, Kubernetes, and GitHub Actions, cutting release cycles from 3 hours to 12 minutes.
                • Spearheaded engineering migration to AWS Cloud (EC2, S3, RDS), saving $85K in annual infrastructure hosting costs.
                
                Technical Skills:
                Java, Spring Boot, React.js, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, Redis, Apache Kafka, CI/CD, Git
                
                Education:
                B.Tech in Computer Science and Engineering, IIT Bombay
                """;

        AtsAnalysisDocument report1 = analyzerService.auditResumeStandalone(weakResume, "Rahul_Resume.pdf", "Full Stack Software Engineer", "rahul@test.com");
        AtsAnalysisDocument report2 = analyzerService.auditResumeStandalone(strongResume, "Priya_Resume.pdf", "Senior Full Stack Architect", "priya@test.com");

        // Verify Candidate Identity extraction (Pin-to-Pin)
        assertEquals("Rahul Sharma", report1.getCandidateNameExtracted());
        assertEquals("BCA in Computer Science", report1.getDetectedDegree());
        assertTrue(report1.getContactSummary().contains("rahul.sharma@example.com"));
        assertTrue(report1.getContactSummary().contains("Phone: ✗ Missing"));
        assertTrue(report1.getContactSummary().contains("LinkedIn: ✗ Missing"));

        assertEquals("Dr. Priya Deshmukh", report2.getCandidateNameExtracted());
        assertTrue(report2.getDetectedDegree().contains("B.Tech in Computer Science"));
        assertTrue(report2.getContactSummary().contains("+91 9876543210"));
        assertTrue(report2.getContactSummary().contains("linkedin.com/in/priyadeshmukh"));
        assertTrue(report2.getContactSummary().contains("github.com/priyadeshmukh"));

        // Verify Scores are significantly different and reflective
        assertTrue(report1.getAtsScore() < 65.0, "Weak resume score should reflect areas of improvement (< 65), got: " + report1.getAtsScore());
        assertTrue(report2.getAtsScore() >= 80.0, "Strong resume score should be high (>= 80), got: " + report2.getAtsScore());
        assertNotEquals(report1.getAtsScore(), report2.getAtsScore());

        // Verify Line-by-Line Bullet Audits quote actual candidate bullet text
        assertFalse(report1.getBulletAudits().isEmpty());
        String firstAudit = report1.getBulletAudits().get(0);
        assertTrue(firstAudit.contains("Responsible for") || firstAudit.contains("Worked on"),
                "Bullet audit must quote candidate's exact weak bullet: " + firstAudit);
        assertTrue(firstAudit.contains("REWRITE:"), "Must provide Google XYZ rewrite");

        // Verify Mistakes list is authentic and references specific findings
        assertTrue(report1.getMistakes().stream().anyMatch(m -> m.contains("Missing Phone Number")));
        assertTrue(report1.getMistakes().stream().anyMatch(m -> m.contains("Missing LinkedIn URL")));
        assertTrue(report1.getMistakes().stream().anyMatch(m -> m.contains("Zero Measurable Metrics") || m.contains("Bullet Point Issue")));

        System.out.println("=== TEST REPORT 1 (Junior/Weak Resume) ===");
        System.out.println("Candidate: " + report1.getCandidateNameExtracted());
        System.out.println("Degree: " + report1.getDetectedDegree());
        System.out.println("Score: " + report1.getAtsScore() + "% (" + report1.getMatchTier() + ")");
        System.out.println("Mistakes: " + report1.getMistakes());
        System.out.println("Bullet Audits: " + report1.getBulletAudits());

        System.out.println("\n=== TEST REPORT 2 (Senior/Strong Resume) ===");
        System.out.println("Candidate: " + report2.getCandidateNameExtracted());
        System.out.println("Degree: " + report2.getDetectedDegree());
        System.out.println("Score: " + report2.getAtsScore() + "% (" + report2.getMatchTier() + ")");
        System.out.println("Top Strengths: " + report2.getTopStrengths());
    }
}
