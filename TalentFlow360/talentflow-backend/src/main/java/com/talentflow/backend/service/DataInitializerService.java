package com.talentflow.backend.service;

import com.talentflow.backend.entity.*;
import com.talentflow.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class DataInitializerService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerService.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SkillRepository skillRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ResumeRepository resumeRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final NotificationRepository notificationRepository;

    public DataInitializerService(RoleRepository roleRepository,
                                  UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  SkillRepository skillRepository,
                                  CandidateProfileRepository candidateProfileRepository,
                                  RecruiterProfileRepository recruiterProfileRepository,
                                  EducationRepository educationRepository,
                                  ExperienceRepository experienceRepository,
                                  CandidateSkillRepository candidateSkillRepository,
                                  ResumeRepository resumeRepository,
                                  CompanyRepository companyRepository,
                                  JobRepository jobRepository,
                                  JobSkillRepository jobSkillRepository,
                                  NotificationRepository notificationRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.skillRepository = skillRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.resumeRepository = resumeRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.jobSkillRepository = jobSkillRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initDefaultUsers();
        initSkills();
        initDemoProfiles();
        initCompaniesAndJobs();
        initNotifications();
    }

    private void initRoles() {
        createRoleIfNotFound(RoleType.ROLE_JOB_SEEKER, "Job seeker with application submission and profile management");
        createRoleIfNotFound(RoleType.ROLE_RECRUITER, "Recruiter with job publishing, candidate review, and interview scheduling");
        createRoleIfNotFound(RoleType.ROLE_HR_MANAGER, "HR Manager with recruitment oversight, vacancy approval, and analytics");
        createRoleIfNotFound(RoleType.ROLE_SUPER_ADMIN, "Super Administrator with platform governance and security controls");
    }

    private void createRoleIfNotFound(RoleType roleType, String description) {
        if (!roleRepository.existsByName(roleType)) {
            Role role = new Role(roleType, description);
            roleRepository.save(role);
            log.info("Initialized system role: {}", roleType);
        }
    }

    private void initDefaultUsers() {
        // 1. Super Admin
        userRepository.findByEmail("admin@talentflow360.com").ifPresentOrElse(
                admin -> {
                    if (!"Rajesh".equals(admin.getFirstName())) {
                        admin.setFirstName("Rajesh");
                        admin.setLastName("Verma");
                        admin.setPhone("+91 98100 54321");
                        userRepository.save(admin);
                    }
                },
                () -> {
                    Role adminRole = roleRepository.findByName(RoleType.ROLE_SUPER_ADMIN).orElseThrow();
                    User admin = new User(
                            "admin@talentflow360.com",
                            passwordEncoder.encode("Admin@123456"),
                            "Rajesh",
                            "Verma",
                            "+91 98100 54321",
                            UserStatus.ACTIVE
                    );
                    admin.setRoles(Set.of(adminRole));
                    userRepository.save(admin);
                    log.info("Default Super Admin initialized: admin@talentflow360.com");
                }
        );

        // 2. Demo Recruiter
        userRepository.findByEmail("recruiter@talentflow360.com").ifPresentOrElse(
                recruiter -> {
                    if (!"Priya".equals(recruiter.getFirstName())) {
                        recruiter.setFirstName("Priya");
                        recruiter.setLastName("Nair");
                        recruiter.setPhone("+91 98450 12345");
                        userRepository.save(recruiter);
                    }
                },
                () -> {
                    Role recruiterRole = roleRepository.findByName(RoleType.ROLE_RECRUITER).orElseThrow();
                    User recruiter = new User(
                            "recruiter@talentflow360.com",
                            passwordEncoder.encode("Recruiter@123"),
                            "Priya",
                            "Nair",
                            "+91 98450 12345",
                            UserStatus.ACTIVE
                    );
                    recruiter.setRoles(Set.of(recruiterRole));
                    userRepository.save(recruiter);
                    log.info("Demo Recruiter initialized: recruiter@talentflow360.com");
                }
        );

        // 3. Demo Candidate
        userRepository.findByEmail("candidate@talentflow360.com").ifPresentOrElse(
                candidate -> {
                    if (!"Aarav".equals(candidate.getFirstName())) {
                        candidate.setFirstName("Aarav");
                        candidate.setLastName("Sharma");
                        candidate.setPhone("+91 98765 43210");
                        userRepository.save(candidate);
                    }
                },
                () -> {
                    Role candidateRole = roleRepository.findByName(RoleType.ROLE_JOB_SEEKER).orElseThrow();
                    User candidate = new User(
                            "candidate@talentflow360.com",
                            passwordEncoder.encode("Candidate@123"),
                            "Aarav",
                            "Sharma",
                            "+91 98765 43210",
                            UserStatus.ACTIVE
                    );
                    candidate.setRoles(Set.of(candidateRole));
                    userRepository.save(candidate);
                    log.info("Demo Candidate initialized: candidate@talentflow360.com");
                }
        );
    }

    private void initSkills() {
        createSkillIfNotFound("Java", SkillCategory.BACKEND);
        createSkillIfNotFound("Python", SkillCategory.BACKEND);
        createSkillIfNotFound("TypeScript", SkillCategory.FRONTEND);
        createSkillIfNotFound("JavaScript", SkillCategory.FRONTEND);
        createSkillIfNotFound("SQL", SkillCategory.DATABASE);
        createSkillIfNotFound("Spring Boot", SkillCategory.BACKEND);
        createSkillIfNotFound("Hibernate", SkillCategory.BACKEND);
        createSkillIfNotFound("React.js", SkillCategory.FRONTEND);
        createSkillIfNotFound("Node.js", SkillCategory.BACKEND);
        createSkillIfNotFound("MySQL", SkillCategory.DATABASE);
        createSkillIfNotFound("PostgreSQL", SkillCategory.DATABASE);
        createSkillIfNotFound("MongoDB", SkillCategory.DATABASE);
        createSkillIfNotFound("Docker", SkillCategory.DEVOPS);
        createSkillIfNotFound("Kubernetes", SkillCategory.DEVOPS);
        createSkillIfNotFound("AWS", SkillCategory.DEVOPS);
        createSkillIfNotFound("REST API", SkillCategory.BACKEND);
        createSkillIfNotFound("Microservices", SkillCategory.BACKEND);
        createSkillIfNotFound("Tailwind CSS", SkillCategory.FRONTEND);
        createSkillIfNotFound("Agile / Scrum", SkillCategory.GENERAL);
    }

    private void createSkillIfNotFound(String name, SkillCategory category) {
        if (!skillRepository.existsByNameIgnoreCase(name)) {
            skillRepository.save(new Skill(name, category));
        }
    }

    private void initDemoProfiles() {
        // Initialize Demo Candidate Profile
        userRepository.findByEmail("candidate@talentflow360.com").ifPresent(user -> {
            Optional<CandidateProfile> opt = candidateProfileRepository.findByUserId(user.getId());
            if (opt.isEmpty()) {
                CandidateProfile profile = new CandidateProfile(user);
                profile.setHeadline("Senior Full Stack Java Engineer | Spring Boot | React | Microservices");
                profile.setBio("Passionate Full Stack Software Engineer with 4+ years of experience designing and implementing scalable web applications, RESTful microservices, and modern responsive user interfaces in Indian tech ecosystems.");
                profile.setLocation("Bengaluru, Karnataka, India");
                profile.setTotalExperienceYears(4.5);
                profile.setCurrentSalary(1400000.0);
                profile.setExpectedSalary(2200000.0);
                profile.setWebsiteUrl("https://aaravsharma.dev");
                profile.setGithubUrl("https://github.com/aaravsharma-dev");
                profile.setLinkedinUrl("https://linkedin.com/in/aaravsharma-dev");
                CandidateProfile savedProfile = candidateProfileRepository.save(profile);

                // Add sample Education
                Education edu = new Education(
                        savedProfile,
                        "Indian Institute of Technology (IIT) Bombay",
                        "Bachelor of Technology (B.Tech)",
                        "Computer Science and Engineering",
                        "2018",
                        "2022",
                        "8.9 CGPA",
                        "Department Gold Medalist, Capstone Project in Distributed Systems"
                );
                educationRepository.save(edu);

                // Add sample Experience
                Experience exp1 = new Experience(
                        savedProfile,
                        "CloudScale Technologies India",
                        "Senior Full Stack Developer",
                        "Bengaluru, Karnataka",
                        "2022-06",
                        "Present",
                        true,
                        "Architected and deployed high-throughput microservices using Spring Boot, Spring Security, and React frontend."
                );
                Experience exp2 = new Experience(
                        savedProfile,
                        "NextGen Software Labs India",
                        "Software Engineer",
                        "Pune, Maharashtra",
                        "2020-01",
                        "2022-05",
                        false,
                        "Built robust RESTful APIs, optimized MySQL database queries, and implemented responsive React UI dashboards."
                );
                experienceRepository.saveAll(List.of(exp1, exp2));

                // Add sample Skills
                skillRepository.findByNameIgnoreCase("Java").ifPresent(skill ->
                        candidateSkillRepository.save(new CandidateSkill(savedProfile, skill, ProficiencyLevel.EXPERT, 4.5)));
                skillRepository.findByNameIgnoreCase("Spring Boot").ifPresent(skill ->
                        candidateSkillRepository.save(new CandidateSkill(savedProfile, skill, ProficiencyLevel.EXPERT, 4.0)));
                skillRepository.findByNameIgnoreCase("React.js").ifPresent(skill ->
                        candidateSkillRepository.save(new CandidateSkill(savedProfile, skill, ProficiencyLevel.ADVANCED, 3.5)));
                skillRepository.findByNameIgnoreCase("TypeScript").ifPresent(skill ->
                        candidateSkillRepository.save(new CandidateSkill(savedProfile, skill, ProficiencyLevel.ADVANCED, 3.0)));
                skillRepository.findByNameIgnoreCase("Docker").ifPresent(skill ->
                        candidateSkillRepository.save(new CandidateSkill(savedProfile, skill, ProficiencyLevel.INTERMEDIATE, 2.5)));

                // Add sample Resume
                Resume resume = new Resume(
                        savedProfile,
                        "Aarav Sharma - Senior Full Stack Engineer Resume.pdf",
                        "Aarav_Sharma_Resume_2026.pdf",
                        "/uploads/resumes/demo_candidate_resume.pdf",
                        245760L,
                        "application/pdf",
                        true
                );
                resumeRepository.save(resume);

                log.info("Demo Candidate Profile & Portfolio successfully initialized with Indian compensation (14 - 22 LPA).");
            } else {
                // Ensure existing candidate profile has Indian compensation, URLs & location
                CandidateProfile existing = opt.get();
                boolean changed = false;
                if (existing.getCurrentSalary() == null || existing.getCurrentSalary() < 500000.0) {
                    existing.setCurrentSalary(1400000.0);
                    existing.setExpectedSalary(2200000.0);
                    existing.setLocation("Bengaluru, Karnataka, India");
                    changed = true;
                }
                if (existing.getWebsiteUrl() != null && existing.getWebsiteUrl().contains("alexmorgan")) {
                    existing.setWebsiteUrl("https://aaravsharma.dev");
                    existing.setGithubUrl("https://github.com/aaravsharma-dev");
                    existing.setLinkedinUrl("https://linkedin.com/in/aaravsharma-dev");
                    changed = true;
                }
                if (changed) {
                    candidateProfileRepository.save(existing);
                    log.info("Updated existing Candidate Profile to Indian standards (Aarav Sharma, 14 - 22 LPA).");
                }
                // Sync any resume titled Alex Morgan
                List<Resume> resumes = resumeRepository.findByCandidateProfileId(existing.getId());
                for (Resume r : resumes) {
                    if (r.getTitle() != null && r.getTitle().contains("Alex")) {
                        r.setTitle("Aarav Sharma - Senior Full Stack Engineer Resume.pdf");
                        r.setFileName("Aarav_Sharma_Resume_2026.pdf");
                        resumeRepository.save(r);
                    }
                }
            }
        });

        // Initialize Demo Recruiter Profile
        userRepository.findByEmail("recruiter@talentflow360.com").ifPresent(user -> {
            Company apexCompany = companyRepository.findByNameIgnoreCase("Apex Global Technologies India")
                    .orElseGet(() -> companyRepository.save(new Company(
                            "Apex Global Technologies India",
                            "Leading enterprise cloud software and automated intelligence platform provider in India.",
                            "https://apextech.io",
                            "Software & Internet",
                            "501-1000 employees",
                            "Bengaluru, Karnataka",
                            "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&q=80",
                            true
                    )));

            if (!recruiterProfileRepository.existsByUserId(user.getId())) {
                RecruiterProfile profile = new RecruiterProfile(
                        user,
                        "Apex Global Technologies India",
                        "Lead Technical Talent Acquisition Specialist",
                        "Engineering Recruiting",
                        "recruiter@talentflow360.com",
                        "+91 98450 12345",
                        "https://linkedin.com/in/talentflow-recruiter",
                        true
                );
                profile.setCompany(apexCompany);
                recruiterProfileRepository.save(profile);
                log.info("Demo Recruiter Profile successfully initialized.");
            }
        });
    }

    private void initCompaniesAndJobs() {
        // Sync any existing jobs in database to Indian Rupee and LPA formatting
        List<Job> existingJobs = jobRepository.findAll();
        if (!existingJobs.isEmpty()) {
            boolean anyUpdated = false;
            for (Job job : existingJobs) {
                if (!"INR".equalsIgnoreCase(job.getCurrency()) || (job.getMinSalary() != null && job.getMinSalary() < 500000.0)) {
                    job.setCurrency("INR");
                    if (job.getTitle().contains("Java")) {
                        job.setMinSalary(1400000.0);
                        job.setMaxSalary(2200000.0);
                        job.setLocation("Bengaluru, Karnataka");
                    } else if (job.getTitle().contains("Frontend")) {
                        job.setMinSalary(1800000.0);
                        job.setMaxSalary(2800000.0);
                        job.setLocation("Remote India");
                    } else if (job.getTitle().contains("DevOps")) {
                        job.setMinSalary(1300000.0);
                        job.setMaxSalary(1900000.0);
                        job.setLocation("Hyderabad, Telangana");
                    } else if (job.getTitle().contains("Microservices")) {
                        job.setMinSalary(1600000.0);
                        job.setMaxSalary(2500000.0);
                        job.setLocation("Pune, Maharashtra");
                    } else if (job.getTitle().contains("AI")) {
                        job.setMinSalary(1500000.0);
                        job.setMaxSalary(2400000.0);
                        job.setLocation("Bengaluru, Karnataka");
                    } else {
                        job.setMinSalary(800000.0);
                        job.setMaxSalary(1400000.0);
                        job.setLocation("Mumbai, Maharashtra");
                    }
                    jobRepository.save(job);
                    anyUpdated = true;
                }
            }
            if (anyUpdated) {
                log.info("Successfully synchronized existing jobs in MySQL to Indian LPA compensation & Indian tech hubs.");
            }
            return;
        }

        // 1. Apex Global Technologies India
        Company apex = companyRepository.findByNameIgnoreCase("Apex Global Technologies India")
                .orElseGet(() -> companyRepository.save(new Company(
                        "Apex Global Technologies India",
                        "Leading enterprise cloud software and automated intelligence platform provider in India.",
                        "https://apextech.io",
                        "Software & Internet",
                        "501-1000 employees",
                        "Bengaluru, Karnataka",
                        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&q=80",
                        true
                )));

        // 2. CloudScale Systems India
        Company cloudscale = companyRepository.findByNameIgnoreCase("CloudScale Systems India")
                .orElseGet(() -> companyRepository.save(new Company(
                        "CloudScale Systems India",
                        "Next-generation Kubernetes orchestration and distributed cloud infrastructure.",
                        "https://cloudscale.net",
                        "Cloud Infrastructure",
                        "201-500 employees",
                        "Hyderabad, Telangana",
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80",
                        true
                )));

        // 3. NexaByte AI India
        Company nexabyte = companyRepository.findByNameIgnoreCase("NexaByte AI India")
                .orElseGet(() -> companyRepository.save(new Company(
                        "NexaByte AI India",
                        "Autonomous machine learning pipelines and real-time predictive analytics engines.",
                        "https://nexabyte.ai",
                        "Artificial Intelligence",
                        "51-200 employees",
                        "Bengaluru, Karnataka",
                        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&q=80",
                        true
                )));

        // 4. Finova Solutions India
        Company finova = companyRepository.findByNameIgnoreCase("Finova Solutions India")
                .orElseGet(() -> companyRepository.save(new Company(
                        "Finova Solutions India",
                        "Global banking infrastructure, real-time UPI payment rails, and digital assets.",
                        "https://finovasolutions.com",
                        "Fintech & Banking",
                        "1000+ employees",
                        "Mumbai, Maharashtra",
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&q=80",
                        true
                )));

        User recruiterUser = userRepository.findByEmail("recruiter@talentflow360.com").orElse(null);
        if (recruiterUser == null) return;

        // JOB 1: Senior Full Stack Java Engineer (Apex, Bengaluru) - 14 - 22 LPA
        Job job1 = new Job(
                apex,
                recruiterUser,
                "Senior Full Stack Java Engineer",
                "Join our core platform engineering team in Bengaluru to build scalable, mission-critical SaaS architectures. You will lead development on distributed microservices, design event-driven workflows, and collaborate directly with product and design teams.",
                "• 3+ years experience in Java & Spring Boot ecosystem\n• Solid expertise in React.js, TypeScript, and modern CSS frameworks\n• Practical knowledge of MySQL, JPA/Hibernate, and query optimization\n• Familiarity with containerization (Docker) and CI/CD pipelines",
                "• Architect high-throughput REST APIs and microservice communication\n• Implement clean, accessible user interfaces using React and Tailwind CSS\n• Participate in code reviews, design docs, and sprint planning",
                "Bengaluru, Karnataka",
                WorkplaceType.HYBRID,
                EmploymentType.FULL_TIME,
                1400000.0,
                2200000.0,
                3,
                2,
                JobStatus.PUBLISHED
        );
        job1.setCurrency("INR");
        jobRepository.save(job1);
        addJobSkill(job1, "Java", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job1, "Spring Boot", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job1, "React.js", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job1, "MySQL", SkillRequirementLevel.PREFERRED, 2.0);
        addJobSkill(job1, "Docker", SkillRequirementLevel.PREFERRED, 1.0);

        // JOB 2: Lead Frontend Architect (Apex, Remote India) - 18 - 28 LPA
        Job job2 = new Job(
                apex,
                recruiterUser,
                "Lead Frontend Architect (React & TypeScript)",
                "We are seeking an experienced Frontend Architect to drive our Design System and SaaS client engineering across India. You will establish UI guidelines, optimize performance, and elevate our user experience.",
                "• 4+ years of professional experience with React.js and modern JavaScript/TypeScript\n• Strong command of responsive web design, state management, and accessibility\n• Experience with Vite, Tailwind CSS, and headless UI libraries",
                "• Standardize modular UI component architecture across multiple web properties\n• Mentor mid-level and junior frontend developers\n• Optimize client bundle size and Core Web Vitals",
                "Remote India",
                WorkplaceType.REMOTE,
                EmploymentType.FULL_TIME,
                1800000.0,
                2800000.0,
                4,
                1,
                JobStatus.PUBLISHED
        );
        job2.setCurrency("INR");
        jobRepository.save(job2);
        addJobSkill(job2, "React.js", SkillRequirementLevel.REQUIRED, 4.0);
        addJobSkill(job2, "TypeScript", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job2, "Tailwind CSS", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job2, "REST API", SkillRequirementLevel.PREFERRED, 2.0);

        // JOB 3: Cloud DevOps & Platform Engineer (CloudScale, Hyderabad) - 13 - 19 LPA
        Job job3 = new Job(
                cloudscale,
                recruiterUser,
                "Cloud DevOps & Platform Engineer",
                "CloudScale Systems is hiring a Cloud DevOps Engineer in Hyderabad to maintain automated deployment pipelines, monitor infrastructure resilience, and manage multi-region Kubernetes clusters on AWS.",
                "• 3+ years experience managing cloud infrastructure (AWS/GCP)\n• Hands-on expertise with Docker containerization and Kubernetes orchestration\n• Strong scripting proficiency in Python or Bash",
                "• Maintain Infrastructure as Code (Terraform) and GitOps deployment workflows\n• Manage Prometheus and Grafana telemetry dashboards\n• Ensure 99.99% system availability and rapid incident response",
                "Hyderabad, Telangana",
                WorkplaceType.REMOTE,
                EmploymentType.FULL_TIME,
                1300000.0,
                1900000.0,
                3,
                1,
                JobStatus.PUBLISHED
        );
        job3.setCurrency("INR");
        jobRepository.save(job3);
        addJobSkill(job3, "Docker", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job3, "Kubernetes", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job3, "AWS", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job3, "Python", SkillRequirementLevel.PREFERRED, 2.0);

        // JOB 4: Senior Backend Microservices Architect (CloudScale, Pune) - 16 - 25 LPA
        Job job4 = new Job(
                cloudscale,
                recruiterUser,
                "Senior Backend Microservices Architect",
                "Design and evolve distributed financial data pipes and high-volume transaction processing systems with low latency and rock-solid fault tolerance in Pune.",
                "• 5+ years building backend distributed systems in Java\n• Deep knowledge of Spring Boot, Spring Security, and transaction management\n• Experience with event streaming (Kafka/RabbitMQ) and relational databases",
                "• Architect asynchronous event-driven services\n• Conduct database query tuning and profiling under high concurrency\n• Establish engineering best practices and architectural design records",
                "Pune, Maharashtra",
                WorkplaceType.HYBRID,
                EmploymentType.FULL_TIME,
                1600000.0,
                2500000.0,
                5,
                2,
                JobStatus.PUBLISHED
        );
        job4.setCurrency("INR");
        jobRepository.save(job4);
        addJobSkill(job4, "Java", SkillRequirementLevel.REQUIRED, 5.0);
        addJobSkill(job4, "Spring Boot", SkillRequirementLevel.REQUIRED, 4.0);
        addJobSkill(job4, "Microservices", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job4, "Kubernetes", SkillRequirementLevel.PREFERRED, 2.0);

        // JOB 5: AI & Data Pipeline Engineer (NexaByte AI, Bengaluru) - 15 - 24 LPA
        Job job5 = new Job(
                nexabyte,
                recruiterUser,
                "AI & Data Pipeline Engineer",
                "Work at the cutting edge of AI in Bengaluru! Design scalable ETL pipelines, feature stores, and automated data ingestion services that feed our deep learning models.",
                "• 3+ years in data engineering or backend data platforms\n• Strong Python and SQL programming capabilities\n• Experience with NoSQL (MongoDB) and columnar databases",
                "• Build resilient ETL batch and streaming pipelines\n• Optimize data retrieval for model inference endpoints\n• Collaborate with Data Scientists on feature engineering pipelines",
                "Bengaluru, Karnataka",
                WorkplaceType.HYBRID,
                EmploymentType.FULL_TIME,
                1500000.0,
                2400000.0,
                3,
                1,
                JobStatus.PUBLISHED
        );
        job5.setCurrency("INR");
        jobRepository.save(job5);
        addJobSkill(job5, "Python", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job5, "SQL", SkillRequirementLevel.REQUIRED, 3.0);
        addJobSkill(job5, "MongoDB", SkillRequirementLevel.PREFERRED, 2.0);
        addJobSkill(job5, "Docker", SkillRequirementLevel.PREFERRED, 1.0);

        // JOB 6: Full Stack Web Engineer (Finova Solutions, Mumbai) - 8 - 14 LPA
        Job job6 = new Job(
                finova,
                recruiterUser,
                "Full Stack Web Engineer (Fintech & UPI Rails)",
                "We need a versatile Full Stack Developer in Mumbai to deliver customer-facing banking portal upgrades and payment verification dashboards.",
                "• 2+ years experience building web applications with Node.js and React\n• Solid understanding of relational database modeling (PostgreSQL/MySQL)\n• Strong appreciation for secure coding practices and API security",
                "• Implement responsive checkout and transaction reporting views\n• Integrate third-party banking APIs and webhooks\n• Write comprehensive automated unit and integration tests",
                "Mumbai, Maharashtra",
                WorkplaceType.REMOTE,
                EmploymentType.CONTRACT,
                800000.0,
                1400000.0,
                2,
                1,
                JobStatus.PUBLISHED
        );
        job6.setCurrency("INR");
        jobRepository.save(job6);
        addJobSkill(job6, "JavaScript", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job6, "Node.js", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job6, "React.js", SkillRequirementLevel.REQUIRED, 2.0);
        addJobSkill(job6, "PostgreSQL", SkillRequirementLevel.REQUIRED, 2.0);

        log.info("Initialized 4 enterprise Indian companies and 6 sample jobs with skill mappings in Indian Rupees (LPA).");
    }

    private void addJobSkill(Job job, String skillName, SkillRequirementLevel reqLevel, Double minExp) {
        skillRepository.findByNameIgnoreCase(skillName).ifPresent(skill -> {
            JobSkill js = new JobSkill(job, skill, reqLevel, minExp);
            jobSkillRepository.save(js);
        });
    }

    private void initNotifications() {
        if (notificationRepository.count() > 0) {
            return;
        }

        userRepository.findByEmail("alex.morgan@example.com").ifPresent(alex -> {
            // 1. Offer Released (Unread)
            Notification n1 = new Notification(
                    alex,
                    "Offer Letter Extended! 📜",
                    "Apex Global Technologies has rolled out a formal offer for Lead Cloud Architect (₹34 LPA). Click to review compensation & terms.",
                    NotificationType.OFFER_RELEASED,
                    "#candidate-hub",
                    "company=Apex Global Technologies"
            );
            notificationRepository.save(n1);

            // 2. Scorecard Submitted (Unread)
            Notification n2 = new Notification(
                    alex,
                    "Interview Scorecard Submitted",
                    "Your Round 2 System Design evaluation for Lead Cloud Architect was submitted with rating 4.8/5.0 (STRONG_HIRE).",
                    NotificationType.INTERVIEW_FEEDBACK_SUBMITTED,
                    "#candidate-hub",
                    "round=Round 2 System Design"
            );
            notificationRepository.save(n2);

            // 3. Technical Round Scheduled (Read)
            Notification n3 = new Notification(
                    alex,
                    "Technical Round 2 Scheduled",
                    "System Design interview scheduled with Sarah Jenkins on Google Meet.",
                    NotificationType.INTERVIEW_SCHEDULED,
                    "#candidate-hub",
                    "round=Tech Round 2"
            );
            n3.setRead(true);
            notificationRepository.save(n3);

            // 4. Application Shortlisted (Read)
            Notification n4 = new Notification(
                    alex,
                    "Application Shortlisted! 🎉",
                    "Razorpay hiring team shortlisted your profile for Senior Full Stack Engineer.",
                    NotificationType.APPLICATION_STATUS_UPDATED,
                    "#candidate-hub",
                    "company=Razorpay"
            );
            n4.setRead(true);
            notificationRepository.save(n4);

            // 5. Welcome Notification (Read)
            Notification n5 = new Notification(
                    alex,
                    "Welcome to TalentFlow 360! 🚀",
                    "Explore curated openings across Bengaluru, Hyderabad & Pune tech hubs or use the AI Resume Builder with 10 templates.",
                    NotificationType.SYSTEM_ALERT,
                    "#resume-builder",
                    "welcome=true"
            );
            n5.setRead(true);
            notificationRepository.save(n5);
        });

        userRepository.findByEmail("sarah.jenkins@example.com").ifPresent(sarah -> {
            // 1. Recruiter New Applicant (Unread)
            Notification rn1 = new Notification(
                    sarah,
                    "New Job Applicant",
                    "Alex Morgan applied for Lead Cloud Architect (Bengaluru Hub). Overall experience: 5.5 years.",
                    NotificationType.JOB_APPLICATION_RECEIVED,
                    "#recruiter-hub",
                    "candidate=Alex Morgan"
            );
            notificationRepository.save(rn1);

            // 2. Interview Scorecard Logged (Unread)
            Notification rn2 = new Notification(
                    sarah,
                    "Interview Scorecard Logged",
                    "Interviewer submitted feedback for Alex Morgan: 4.8/5.0 | Recommendation: STRONG_HIRE.",
                    NotificationType.INTERVIEW_FEEDBACK_SUBMITTED,
                    "#recruiter-hub",
                    "candidate=Alex Morgan"
            );
            notificationRepository.save(rn2);

            // 3. Candidate Shortlisted (Read)
            Notification rn3 = new Notification(
                    sarah,
                    "Candidate Shortlisted",
                    "Candidate was shortlisted for Senior React.js Developer role at Apex Global Technologies.",
                    NotificationType.APPLICATION_STATUS_UPDATED,
                    "#recruiter-hub",
                    "status=SHORTLISTED"
            );
            rn3.setRead(true);
            notificationRepository.save(rn3);
        });

        log.info("Initialized default seed notifications for Alex Morgan (Candidate) and Sarah Jenkins (Recruiter).");
    }
}
