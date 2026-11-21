package com.talentflow.backend.service;

import com.talentflow.backend.document.AtsAnalysisDocument;
import com.talentflow.backend.document.ResumeDocument;
import com.talentflow.backend.entity.Application;
import com.talentflow.backend.entity.CandidateProfile;
import com.talentflow.backend.entity.CandidateSkill;
import com.talentflow.backend.entity.Experience;
import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.JobSkill;
import com.talentflow.backend.entity.Resume;
import com.talentflow.backend.entity.SkillRequirementLevel;
import com.talentflow.backend.mongorepository.AtsAnalysisDocumentRepository;
import com.talentflow.backend.mongorepository.ResumeDocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class AtsResumeAnalyzerService {

    private static final Logger log = LoggerFactory.getLogger(AtsResumeAnalyzerService.class);

    private final AtsAnalysisDocumentRepository atsAnalysisRepository;
    private final ResumeDocumentRepository resumeDocumentRepository;

    // Precompiled Regex Patterns for High-Performance ATS Evaluation (O(1) compilation overhead)
    private static final Pattern ASCII_WORD_PATTERN = Pattern.compile("[a-zA-Z0-9#+.-]{2,}");
    private static final Pattern METRIC_PATTERN = Pattern.compile("(\\d+%|\\$\\d+[kKmM]?|₹\\d+[kKmMlL]?|\\d+x|\\b\\d{2,}\\+?\\s*(?:users|clients|customers|requests|queries|tps|qps|endpoints|microservices|tables|records|seconds|ms|percent|lines|engineers|members|projects|features))\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern ACTION_VERB_PATTERN = Pattern.compile("\\b(architected|engineered|spearheaded|developed|designed|implemented|built|optimized|reduced|accelerated|automated|scaled|deployed|streamlined|orchestrated|refactored|launched|created|integrated)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern PASSIVE_PATTERN = Pattern.compile("\\b(responsible for|worked on|helped with|assisted with|handled|tasked with|involved in|participated in|contributed to|duties included|worked as|was part of)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+91[-.\\s]?)?[6-9]\\d{4}[-.\\s]?\\d{5}|\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("linkedin\\.com/(?:in/)?[a-zA-Z0-9_-]+");
    private static final Pattern GITHUB_PATTERN = Pattern.compile("github\\.com/[a-zA-Z0-9_-]+");
    private static final Pattern DEGREE_PATTERN = Pattern.compile("\\b(B\\.?Tech|B\\.?E\\.?|Bachelor of Technology|Bachelor of Engineering|BCA|MCA|M\\.?Tech|M\\.?E\\.?|Master of Technology|B\\.?S\\.?|M\\.?S\\.?|Bachelor of Science|Master of Science|BSc|MSc|MBA|Ph\\.?D)\\b(?:\\s+(?:in|of)?\\s+([A-Za-z\\s&]{3,50}))?", Pattern.CASE_INSENSITIVE);
    private static final Pattern EXP_YEARS_PATTERN = Pattern.compile("(\\d{1,2})\\+?\\s*(?:years?|yrs?)\\s*(?:of)?\\s*(?:experience|exp)?");
    private static final Pattern VERB_STARTING_PATTERN = Pattern.compile("(?i)^[a-z]+(?:ed|ing|s)?\\b.*");

    // Comprehensive 160+ In-Demand Technical Skills Catalog
    private static final Map<String, String> SKILL_CATALOG = new LinkedHashMap<>();
    private static final Map<String, Pattern> SHORT_KEYWORD_PATTERNS = new HashMap<>();

    static {
        // Languages
        registerSkill("Java", "java");
        registerSkill("Python", "python");
        registerSkill("JavaScript", "javascript", "js");
        registerSkill("TypeScript", "typescript", "ts");
        registerSkill("C++", "c++", "cpp");
        registerSkill("C#", "c#", "csharp");
        registerSkill("Go / Golang", "golang", "go");
        registerSkill("Rust", "rust");
        registerSkill("Ruby", "ruby");
        registerSkill("PHP", "php");
        registerSkill("Kotlin", "kotlin");
        registerSkill("Swift", "swift");
        registerSkill("Dart", "dart");
        registerSkill("Scala", "scala");
        registerSkill("R", "r language", "r programming");
        registerSkill("SQL", "sql");
        registerSkill("Shell Scripting", "shell script", "bash", "powershell");
        registerSkill("HTML5", "html5", "html");
        registerSkill("CSS3", "css3", "css");

        // Frontend
        registerSkill("React.js", "react.js", "reactjs", "react");
        registerSkill("Next.js", "next.js", "nextjs");
        registerSkill("Vue.js", "vue.js", "vuejs", "vue");
        registerSkill("Angular", "angular", "angularjs");
        registerSkill("Svelte", "svelte");
        registerSkill("Tailwind CSS", "tailwind css", "tailwind", "tailwindcss");
        registerSkill("Bootstrap", "bootstrap");
        registerSkill("Redux", "redux", "redux toolkit");
        registerSkill("Zustand", "zustand");
        registerSkill("Webpack", "webpack");
        registerSkill("Vite", "vite");
        registerSkill("Sass/SCSS", "sass", "scss");
        registerSkill("Material UI", "material ui", "mui");

        // Backend
        registerSkill("Spring Boot", "spring boot", "springboot");
        registerSkill("Spring Security", "spring security");
        registerSkill("Spring Data JPA", "spring data jpa", "spring data");
        registerSkill("Hibernate", "hibernate", "jpa");
        registerSkill("Node.js", "node.js", "nodejs", "node");
        registerSkill("Express.js", "express.js", "expressjs", "express");
        registerSkill("NestJS", "nestjs", "nest.js");
        registerSkill("Django", "django");
        registerSkill("FastAPI", "fastapi");
        registerSkill("Flask", "flask");
        registerSkill("Ruby on Rails", "ruby on rails", "rails");
        registerSkill("ASP.NET Core", "asp.net", ".net core", "dotnet");
        registerSkill("Laravel", "laravel");
        registerSkill("Microservices", "microservices", "microservice architecture");
        registerSkill("RESTful APIs", "rest api", "restful api", "rest apis", "restful");
        registerSkill("GraphQL", "graphql");
        registerSkill("gRPC", "grpc");
        registerSkill("WebSockets", "websocket", "websockets");

        // Cloud & DevOps
        registerSkill("AWS", "aws", "amazon web services", "ec2", "s3", "lambda");
        registerSkill("Azure", "azure", "microsoft azure");
        registerSkill("GCP", "gcp", "google cloud");
        registerSkill("Docker", "docker", "dockerfile", "containerization");
        registerSkill("Kubernetes", "kubernetes", "k8s");
        registerSkill("Terraform", "terraform");
        registerSkill("Ansible", "ansible");
        registerSkill("Jenkins", "jenkins");
        registerSkill("CI/CD", "ci/cd", "ci-cd", "continuous integration");
        registerSkill("GitHub Actions", "github actions");
        registerSkill("GitLab CI", "gitlab ci");
        registerSkill("Helm", "helm");
        registerSkill("ArgoCD", "argocd", "argo cd");
        registerSkill("Prometheus", "prometheus");
        registerSkill("Grafana", "grafana");
        registerSkill("Datadog", "datadog");
        registerSkill("ELK Stack", "elk stack", "logstash", "kibana");
        registerSkill("Nginx", "nginx");
        registerSkill("Linux", "linux", "ubuntu", "centos");

        // Databases & Caching
        registerSkill("PostgreSQL", "postgresql", "postgres");
        registerSkill("MySQL", "mysql");
        registerSkill("MongoDB", "mongodb", "mongo");
        registerSkill("Redis", "redis");
        registerSkill("Elasticsearch", "elasticsearch");
        registerSkill("Apache Cassandra", "cassandra");
        registerSkill("Oracle Database", "oracle db", "oracle sql");
        registerSkill("DynamoDB", "dynamodb");
        registerSkill("SQLite", "sqlite");
        registerSkill("MariaDB", "mariadb");
        registerSkill("Snowflake", "snowflake");
        registerSkill("BigQuery", "bigquery");
        registerSkill("Neo4j", "neo4j");

        // Messaging & Queues
        registerSkill("Apache Kafka", "kafka", "apache kafka");
        registerSkill("RabbitMQ", "rabbitmq");
        registerSkill("ActiveMQ", "activemq");
        registerSkill("AWS SQS", "sqs", "aws sqs");
        registerSkill("AWS SNS", "sns", "aws sns");
        registerSkill("Celery", "celery");

        // Testing & Quality
        registerSkill("JUnit", "junit", "junit5");
        registerSkill("Mockito", "mockito");
        registerSkill("Jest", "jest");
        registerSkill("Mocha", "mocha");
        registerSkill("Cypress", "cypress");
        registerSkill("Playwright", "playwright");
        registerSkill("Selenium", "selenium");
        registerSkill("Postman", "postman");
        registerSkill("SonarQube", "sonarqube");
        registerSkill("PyTest", "pytest");

        // AI / ML & Data
        registerSkill("Machine Learning", "machine learning", "ml");
        registerSkill("Deep Learning", "deep learning");
        registerSkill("TensorFlow", "tensorflow");
        registerSkill("PyTorch", "pytorch");
        registerSkill("Scikit-Learn", "scikit-learn", "sklearn");
        registerSkill("Pandas", "pandas");
        registerSkill("NumPy", "numpy");
        registerSkill("Apache Spark", "spark", "apache spark");
        registerSkill("Apache Airflow", "airflow");
        registerSkill("Tableau", "tableau");
        registerSkill("Power BI", "power bi");
        registerSkill("NLP", "nlp", "natural language processing");
        registerSkill("LangChain", "langchain");
        registerSkill("HuggingFace", "huggingface");
        registerSkill("OpenCV", "opencv");

        // System Design & Architecture
        registerSkill("System Design", "system design");
        registerSkill("Distributed Systems", "distributed systems");
        registerSkill("Data Structures & Algorithms", "data structures", "dsa", "algorithms");
        registerSkill("OOP", "object oriented", "oop", "oops");
        registerSkill("SOLID Principles", "solid principles", "solid");
        registerSkill("Design Patterns", "design patterns");
        registerSkill("Clean Architecture", "clean architecture");
        registerSkill("TDD", "tdd", "test driven development");
        registerSkill("Agile / Scrum", "agile", "scrum", "jira");
        registerSkill("Git", "git", "github", "gitlab");

        // Precompile regex boundaries for short catalog keywords (O(1) runtime lookup)
        for (String kw : SKILL_CATALOG.keySet()) {
            if (kw.length() <= 3) {
                SHORT_KEYWORD_PATTERNS.put(kw, Pattern.compile("\\b" + Pattern.quote(kw) + "\\b"));
            }
        }
    }

    private static void registerSkill(String displayName, String... keywords) {
        for (String kw : keywords) {
            SKILL_CATALOG.put(kw.toLowerCase(), displayName);
        }
    }

    public AtsResumeAnalyzerService(AtsAnalysisDocumentRepository atsAnalysisRepository,
                                    ResumeDocumentRepository resumeDocumentRepository) {
        this.atsAnalysisRepository = atsAnalysisRepository;
        this.resumeDocumentRepository = resumeDocumentRepository;
    }

    /**
     * Extract plain text content from a byte array (supports PDF, DOCX, Plaintext, Markdown, etc.).
     */
    public String extractText(byte[] fileBytes, String contentType, String fileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            return "";
        }

        String lowerName = fileName != null ? fileName.toLowerCase() : "";
        String lowerType = contentType != null ? contentType.toLowerCase() : "";

        // PDF extraction using Apache PDFBox
        if (lowerName.endsWith(".pdf") || lowerType.contains("pdf")) {
            try (PDDocument document = Loader.loadPDF(fileBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(document);
                if (text != null && !text.isBlank()) {
                    return text.trim();
                }
            } catch (Exception e) {
                log.warn("PDFBox extraction failed for {}, falling back to binary scan: {}", fileName, e.getMessage());
            }
        }

        // DOCX extraction using native ZipInputStream (reads word/document.xml without extra dependencies)
        if (lowerName.endsWith(".docx") || lowerType.contains("wordprocessingml")) {
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(fileBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if ("word/document.xml".equals(entry.getName())) {
                        byte[] buffer = zis.readAllBytes();
                        String xml = new String(buffer, StandardCharsets.UTF_8);
                        String text = xml.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
                        if (!text.isBlank()) {
                            return text;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("DOCX extraction error for {}: {}", fileName, e.getMessage());
            }
        }

        // Plaintext / UTF-8 fallback
        String raw = new String(fileBytes, StandardCharsets.UTF_8);
        if (isPrintable(raw)) {
            return raw.trim();
        }

        // ASCII word regex extraction for binary formats
        Matcher m = ASCII_WORD_PATTERN.matcher(new String(fileBytes, StandardCharsets.ISO_8859_1));
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            sb.append(m.group()).append(" ");
        }
        return sb.toString().trim();
    }

    private boolean isPrintable(String s) {
        int nonPrintable = 0;
        int checkLen = Math.min(s.length(), 500);
        for (int i = 0; i < checkLen; i++) {
            char c = s.charAt(i);
            if (c < 32 && c != '\t' && c != '\n' && c != '\r') {
                nonPrintable++;
            }
        }
        return nonPrintable < checkLen * 0.1;
    }

    /**
     * Analyze resume text against a Job specification and save the result into MongoDB.
     */
    public AtsAnalysisDocument analyzeAndSave(Application application, Job job, Resume resume) {
        String resumeText = "";
        String resumeFileName = "Resume.pdf";

        // Try reading from MongoDB resume document if exists
        if (resume != null && resume.getFilePath() != null && resume.getFilePath().contains("/resumes/")) {
            String[] parts = resume.getFilePath().split("/resumes/");
            if (parts.length > 1) {
                String docId = parts[1].replace("/download", "").trim();
                Optional<ResumeDocument> docOpt = resumeDocumentRepository.findById(docId);
                if (docOpt.isPresent()) {
                    ResumeDocument doc = docOpt.get();
                    resumeText = doc.getParsedText() != null ? doc.getParsedText() : "";
                    resumeFileName = doc.getFileName();
                }
            }
        }

        // Fallback: If resume text wasn't found in Mongo, attempt lookup by candidate profile primary resume
        if (resumeText.isBlank() && application.getCandidateProfile() != null) {
            Optional<ResumeDocument> primaryDoc = resumeDocumentRepository
                    .findByCandidateProfileIdAndIsPrimaryTrue(application.getCandidateProfile().getId());
            if (primaryDoc.isPresent()) {
                resumeText = primaryDoc.get().getParsedText();
                resumeFileName = primaryDoc.get().getFileName();
            }
        }

        // Secondary fallback: synthesize from candidate bio & skills if file text is unavailable
        if (resumeText.isBlank() && application.getCandidateProfile() != null) {
            resumeText = synthesizeCandidateText(application.getCandidateProfile());
        }

        AtsAnalysisDocument analysis = performAtsEvaluation(
                resumeText,
                resumeFileName,
                job,
                application.getCandidateEmail(),
                application.getId()
        );

        return atsAnalysisRepository.save(analysis);
    }

    /**
     * Pre-application ATS evaluation (for candidate preview before submitting).
     */
    public AtsAnalysisDocument evaluatePreApplication(String resumeText, String resumeFileName, Job job, String candidateEmail) {
        return performAtsEvaluation(resumeText, resumeFileName, job, candidateEmail, null);
    }

    /**
     * Core ATS evaluation engine comparing resume text with job requirements (Pin-to-Pin Deep Engine).
     */
    public AtsAnalysisDocument performAtsEvaluation(String resumeText, String resumeFileName, Job job, String candidateEmail, Long applicationId) {
        AtsAnalysisDocument doc = new AtsAnalysisDocument();
        doc.setApplicationId(applicationId);
        doc.setJobId(job != null ? job.getId() : null);
        String jobTitle = (job != null && job.getTitle() != null) ? job.getTitle() : "Software Position";
        doc.setJobTitle(jobTitle);
        doc.setCandidateEmail(candidateEmail);
        doc.setResumeFileName(resumeFileName != null ? resumeFileName : "Resume.pdf");
        doc.setAnalyzedAt(Instant.now());

        String safeText = resumeText != null ? resumeText : "";
        String normResume = safeText.toLowerCase();

        // 1. PIN-TO-PIN CANDIDATE IDENTITY & DOSSIER EXTRACTION
        String candidateName = extractCandidateName(safeText, candidateEmail);
        String extractedEmail = extractEmail(safeText);
        String extractedPhone = extractPhone(safeText);
        String extractedLinkedIn = extractLinkedIn(safeText);
        String extractedGitHub = extractGitHub(safeText);
        String detectedDegree = extractDegree(safeText);
        int detectedYears = extractYearsFromResume(normResume);
        int wordCount = calculateWordCount(safeText);
        List<String> detectedSections = extractDetectedSections(normResume);

        String contactSummary = String.format("Email: %s | Phone: %s | LinkedIn: %s | GitHub: %s",
                (extractedEmail != null ? "✓ " + extractedEmail : (candidateEmail != null ? "✓ " + candidateEmail : "✗ Missing")),
                (extractedPhone != null ? "✓ " + extractedPhone : "✗ Missing"),
                (extractedLinkedIn != null ? "✓ " + extractedLinkedIn : "✗ Missing"),
                (extractedGitHub != null ? "✓ " + extractedGitHub : "✗ Missing"));

        doc.setCandidateNameExtracted(candidateName);
        doc.setDetectedDegree(detectedDegree);
        doc.setDetectedYearsExp(detectedYears);
        doc.setWordCount(wordCount);
        doc.setDetectedSections(detectedSections);
        doc.setContactSummary(contactSummary);

        // 2. SKILL KEYWORDS MATCHING (Against Job Specifications & 160+ Catalog)
        Set<String> requiredSkills = new LinkedHashSet<>();
        Set<String> preferredSkills = new LinkedHashSet<>();

        if (job != null && job.getJobSkills() != null) {
            for (JobSkill js : job.getJobSkills()) {
                if (js.getSkill() != null && js.getSkill().getName() != null) {
                    String skillName = js.getSkill().getName().trim();
                    if (js.getRequirementLevel() == SkillRequirementLevel.REQUIRED) {
                        requiredSkills.add(skillName);
                    } else {
                        preferredSkills.add(skillName);
                    }
                }
            }
        }

        if (requiredSkills.isEmpty() && preferredSkills.isEmpty() && job != null) {
            Set<String> extractedJobSkills = extractCatalogSkillsFromText(job.getTitle() + " " + job.getRequirements() + " " + job.getResponsibilities());
            requiredSkills.addAll(extractedJobSkills);
        }

        Set<String> resumeSkills = extractCatalogSkillsFromText(normResume);
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        double skillsScore = 0.0;
        int totalJobSkills = requiredSkills.size() + preferredSkills.size();

        if (totalJobSkills > 0) {
            double reqMatches = 0;
            for (String req : requiredSkills) {
                if (containsSkillMatch(normResume, resumeSkills, req)) {
                    reqMatches++;
                    matchedKeywords.add(capitalize(req));
                } else {
                    missingKeywords.add(capitalize(req));
                }
            }

            double prefMatches = 0;
            for (String pref : preferredSkills) {
                if (containsSkillMatch(normResume, resumeSkills, pref)) {
                    prefMatches++;
                    matchedKeywords.add(capitalize(pref));
                } else {
                    missingKeywords.add(capitalize(pref));
                }
            }

            double reqWeight = requiredSkills.isEmpty() ? 0 : (reqMatches / requiredSkills.size()) * 25.0;
            double prefWeight = preferredSkills.isEmpty() ? 0 : (prefMatches / preferredSkills.size()) * 10.0;
            skillsScore = Math.min(35.0, reqWeight + (preferredSkills.isEmpty() ? reqWeight * 0.4 : prefWeight));
        } else {
            // Standalone fallback based on catalog matches
            skillsScore = Math.min(35.0, Math.max(10.0, resumeSkills.size() * 3.0));
            matchedKeywords.addAll(resumeSkills.stream().limit(10).toList());
        }

        // Also add additional recognized resume skills to matched list
        for (String s : resumeSkills) {
            if (!matchedKeywords.contains(s) && matchedKeywords.size() < 12) {
                matchedKeywords.add(s);
            }
        }

        // 3. QUANTIFIED IMPACT & EXPERIENCE METRICS (Max 25.0)
        int metricMentions = countMatches(normResume, METRIC_PATTERN);
        double expScore;
        if (metricMentions == 0) expScore = 7.0;
        else if (metricMentions == 1) expScore = 12.0;
        else if (metricMentions == 2) expScore = 17.0;
        else if (metricMentions == 3) expScore = 21.0;
        else expScore = 25.0;

        // 4. ATS STRUCTURE & SECTION HYGIENE (Max 25.0)
        double formatScore = 0.0;
        if (extractedEmail != null || candidateEmail != null) formatScore += 2.5;
        if (extractedPhone != null) formatScore += 2.5;
        if (extractedLinkedIn != null || extractedGitHub != null) formatScore += 2.5;
        if (detectedSections.contains("Work Experience")) formatScore += 4.5;
        if (detectedSections.contains("Technical Skills")) formatScore += 4.0;
        if (detectedSections.contains("Education")) formatScore += 4.0;
        if (detectedSections.contains("Professional Summary") || detectedSections.contains("Projects & Portfolio")) formatScore += 2.5;
        if (wordCount >= 380 && wordCount <= 850) formatScore += 2.5;

        // 5. ACTION VERBS VS PASSIVE CLICHES (Max 15.0)
        int actionVerbMatches = countMatches(normResume, ACTION_VERB_PATTERN);
        int passiveMatches = countMatches(normResume, PASSIVE_PATTERN);

        double clarityScore = Math.min(12.0, actionVerbMatches * 1.8) + 3.0;
        if (passiveMatches > 0) {
            clarityScore = Math.max(3.0, clarityScore - (passiveMatches * 2.0));
        }

        // Total ATS Score (0 - 100)
        double totalAts = Math.round((skillsScore + expScore + formatScore + clarityScore) * 10.0) / 10.0;
        totalAts = Math.min(99.0, Math.max(18.0, totalAts));

        doc.setSkillsScore(Math.round(skillsScore * 10.0) / 10.0);
        doc.setExperienceScore(Math.round(expScore * 10.0) / 10.0);
        doc.setFormatScore(Math.round(formatScore * 10.0) / 10.0);
        doc.setKeywordScore(Math.round(clarityScore * 10.0) / 10.0);
        doc.setAtsScore(totalAts);

        // Match Tier
        String tier;
        if (totalAts >= 85.0) tier = "EXCELLENT_MATCH";
        else if (totalAts >= 70.0) tier = "STRONG_MATCH";
        else if (totalAts >= 55.0) tier = "GOOD_MATCH";
        else if (totalAts >= 40.0) tier = "MODERATE_MATCH";
        else tier = "NEEDS_IMPROVEMENT";
        doc.setMatchTier(tier);

        doc.setMatchedKeywords(matchedKeywords);
        doc.setMissingKeywords(missingKeywords);

        // 6. BULLET POINT EXTRACTION & PIN-TO-PIN AUDITS
        List<String> rawBullets = extractBullets(safeText);
        List<String> bulletAudits = auditBullets(rawBullets, jobTitle);
        doc.setBulletAudits(bulletAudits);

        // 7. PIN-TO-PIN MISTAKES & RED FLAGS
        List<String> mistakes = buildPersonalizedMistakes(bulletAudits, metricMentions, extractedPhone, extractedLinkedIn, extractedGitHub, wordCount, detectedSections, detectedDegree, missingKeywords, jobTitle);
        List<String> improvements = buildPersonalizedImprovements(bulletAudits, missingKeywords, extractedPhone, extractedLinkedIn, extractedGitHub, detectedSections, targetRoleOrJob(jobTitle));

        doc.setMistakes(mistakes);
        doc.setImprovements(improvements);

        // Strengths & Suggestions
        List<String> strengths = new ArrayList<>();
        if (!matchedKeywords.isEmpty()) {
            strengths.add("Strong presence of key technical skills: " + String.join(", ", matchedKeywords.stream().limit(5).toList()));
        }
        if (metricMentions >= 3) {
            strengths.add("Quantified achievements: Detected " + metricMentions + " measurable impact metrics (%, latency, scale) elevating ATS credibility.");
        }
        if (actionVerbMatches >= 3) {
            strengths.add("Active engineering voice: Strong usage of proactive power verbs demonstrating direct technical ownership.");
        }
        if (formatScore >= 18.0) {
            strengths.add("Clean structural layout: Successfully parsed core ATS sections (" + String.join(", ", detectedSections) + ").");
        }

        doc.setTopStrengths(strengths);
        doc.setSuggestions(improvements);
        doc.setSummary(String.format("Resume scored %.1f%% (%s) against %s. Found %d matched skill(s), %d impact metric(s), and %d optimization area(s).",
                totalAts, tier.replace("_", " "), jobTitle, matchedKeywords.size(), metricMentions, mistakes.size()));

        return doc;
    }

    /**
     * Standalone ATS Resume Audit: analyzes any uploaded resume file from the device without requiring a job vacancy.
     * Computes an authentic ATS score, extracts candidate dossier, identifies mistakes & red flags, and provides actionable improvement steps.
     */
    public AtsAnalysisDocument auditResumeStandalone(String resumeText, String resumeFileName, String targetRole, String candidateEmail) {
        AtsAnalysisDocument doc = new AtsAnalysisDocument();
        doc.setCandidateEmail(candidateEmail);
        doc.setResumeFileName(resumeFileName != null ? resumeFileName : "Resume.pdf");
        String role = (targetRole != null && !targetRole.isBlank()) ? targetRole.trim() : "Full Stack Software Engineer";
        doc.setJobTitle(role);
        doc.setAnalyzedAt(Instant.now());

        String safeText = resumeText != null ? resumeText : "";
        String norm = safeText.toLowerCase();

        // 1. PIN-TO-PIN CANDIDATE IDENTITY & DOSSIER EXTRACTION
        String candidateName = extractCandidateName(safeText, candidateEmail);
        String extractedEmail = extractEmail(safeText);
        String extractedPhone = extractPhone(safeText);
        String extractedLinkedIn = extractLinkedIn(safeText);
        String extractedGitHub = extractGitHub(safeText);
        String detectedDegree = extractDegree(safeText);
        int detectedYears = extractYearsFromResume(norm);
        int wordCount = calculateWordCount(safeText);
        List<String> detectedSections = extractDetectedSections(norm);

        String contactSummary = String.format("Email: %s | Phone: %s | LinkedIn: %s | GitHub: %s",
                (extractedEmail != null ? "✓ " + extractedEmail : (candidateEmail != null ? "✓ " + candidateEmail : "✗ Missing")),
                (extractedPhone != null ? "✓ " + extractedPhone : "✗ Missing"),
                (extractedLinkedIn != null ? "✓ " + extractedLinkedIn : "✗ Missing"),
                (extractedGitHub != null ? "✓ " + extractedGitHub : "✗ Missing"));

        doc.setCandidateNameExtracted(candidateName);
        doc.setDetectedDegree(detectedDegree);
        doc.setDetectedYearsExp(detectedYears);
        doc.setWordCount(wordCount);
        doc.setDetectedSections(detectedSections);
        doc.setContactSummary(contactSummary);

        // 2. TECHNICAL & DOMAIN KEYWORDS (From 160+ Catalog)
        Set<String> matchedSkills = extractCatalogSkillsFromText(norm);
        Set<String> expectedDomainSkills = getExpectedSkillsForRole(role);

        List<String> matchedKeywords = new ArrayList<>(matchedSkills);
        List<String> missingKeywords = new ArrayList<>();
        for (String exp : expectedDomainSkills) {
            if (!matchedSkills.contains(exp)) {
                missingKeywords.add(exp);
            }
        }

        double skillsScore;
        if (matchedSkills.isEmpty()) {
            skillsScore = 6.0;
        } else {
            skillsScore = Math.min(35.0, 8.0 + (matchedSkills.size() * 2.7));
        }

        // 3. METRICS & QUANTIFIABLE ACHIEVEMENTS (Max 25.0)
        int metricMentions = countMatches(norm, METRIC_PATTERN);
        double expScore;
        if (metricMentions == 0) expScore = 7.0;
        else if (metricMentions == 1) expScore = 12.0;
        else if (metricMentions == 2) expScore = 17.0;
        else if (metricMentions == 3) expScore = 21.0;
        else expScore = 25.0;

        // 4. STRUCTURAL SECTIONS & FORMATTING (Max 25.0)
        double formatScore = 0.0;
        if (extractedEmail != null || candidateEmail != null) formatScore += 2.5;
        if (extractedPhone != null) formatScore += 2.5;
        if (extractedLinkedIn != null || extractedGitHub != null) formatScore += 2.5;
        if (detectedSections.contains("Work Experience")) formatScore += 4.5;
        if (detectedSections.contains("Technical Skills")) formatScore += 4.0;
        if (detectedSections.contains("Education")) formatScore += 4.0;
        if (detectedSections.contains("Professional Summary") || detectedSections.contains("Projects & Portfolio")) formatScore += 2.5;
        if (wordCount >= 380 && wordCount <= 850) formatScore += 2.5;

        // 5. CLARITY, ACTION VERBS VS PASSIVE CLICHÉS (Max 15.0)
        int actionVerbMatches = countMatches(norm, ACTION_VERB_PATTERN);
        int passiveMatches = countMatches(norm, PASSIVE_PATTERN);

        double clarityScore = Math.min(12.0, actionVerbMatches * 1.8) + 3.0;
        if (passiveMatches > 0) {
            clarityScore = Math.max(3.0, clarityScore - (passiveMatches * 2.0));
        }

        // Total ATS Score (0 - 100)
        double totalScore = Math.round((skillsScore + expScore + formatScore + clarityScore) * 10.0) / 10.0;
        totalScore = Math.min(99.0, Math.max(18.0, totalScore));

        doc.setAtsScore(totalScore);
        doc.setSkillsScore(Math.round(skillsScore * 10.0) / 10.0);
        doc.setExperienceScore(Math.round(expScore * 10.0) / 10.0);
        doc.setFormatScore(Math.round(formatScore * 10.0) / 10.0);
        doc.setKeywordScore(Math.round(clarityScore * 10.0) / 10.0);

        String tier;
        if (totalScore >= 85.0) tier = "EXCELLENT_MATCH";
        else if (totalScore >= 70.0) tier = "STRONG_MATCH";
        else if (totalScore >= 55.0) tier = "GOOD_MATCH";
        else if (totalScore >= 40.0) tier = "MODERATE_MATCH";
        else tier = "NEEDS_IMPROVEMENT";
        doc.setMatchTier(tier);

        doc.setMatchedKeywords(matchedKeywords);
        doc.setMissingKeywords(missingKeywords);

        // 6. BULLET POINT EXTRACTION & PIN-TO-PIN AUDITS
        List<String> rawBullets = extractBullets(safeText);
        List<String> bulletAudits = auditBullets(rawBullets, role);
        doc.setBulletAudits(bulletAudits);

        // 7. PIN-TO-PIN MISTAKES & RED FLAGS
        List<String> mistakes = buildPersonalizedMistakes(bulletAudits, metricMentions, extractedPhone, extractedLinkedIn, extractedGitHub, wordCount, detectedSections, detectedDegree, missingKeywords, role);
        List<String> improvements = buildPersonalizedImprovements(bulletAudits, missingKeywords, extractedPhone, extractedLinkedIn, extractedGitHub, detectedSections, role);

        doc.setMistakes(mistakes);
        doc.setImprovements(improvements);

        // TOP STRENGTHS
        List<String> strengths = new ArrayList<>();
        if (!matchedKeywords.isEmpty()) {
            strengths.add("Parsed " + matchedKeywords.size() + " in-demand technical competencies: " + String.join(", ", matchedKeywords.stream().limit(5).toList()));
        }
        if (metricMentions >= 3) {
            strengths.add("Measurable impact: Found " + metricMentions + " quantified results (%, latency, user volume) boosting recruiter engagement.");
        }
        if (actionVerbMatches >= 3) {
            strengths.add("Strong engineering voice: Usage of high-impact action verbs demonstrating active technical ownership.");
        }
        if (formatScore >= 18.0) {
            strengths.add("Well-structured foundation with standard ATS headings (" + String.join(", ", detectedSections) + ").");
        }

        doc.setTopStrengths(strengths);
        doc.setSuggestions(improvements);
        doc.setSummary(String.format("Resume scored %.1f%% (%s) for %s. Found %d matched skill(s), %d impact metric(s), and %d optimization area(s).",
                totalScore, tier.replace("_", " "), role, matchedKeywords.size(), metricMentions, mistakes.size()));

        return doc;
    }

    public Optional<AtsAnalysisDocument> getAnalysisByApplicationId(Long applicationId) {
        if (applicationId == null) return Optional.empty();
        return atsAnalysisRepository.findByApplicationId(applicationId);
    }

    public List<AtsAnalysisDocument> getAnalysisByCandidateEmail(String candidateEmail) {
        if (candidateEmail == null || candidateEmail.isBlank()) return Collections.emptyList();
        return atsAnalysisRepository.findByCandidateEmail(candidateEmail);
    }

    public AtsAnalysisDocument saveAnalysis(AtsAnalysisDocument doc) {
        return atsAnalysisRepository.save(doc);
    }

    // ==========================================
    // PIN-TO-PIN EXTRACTION & AUDIT HELPERS
    // ==========================================

    public String extractCandidateName(String text, String email) {
        if (text == null || text.isBlank()) {
            return extractNameFromEmail(email);
        }
        String[] lines = text.split("\\r?\\n");
        int count = 0;
        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank()) continue;
            count++;
            if (count > 8) break; // Check first 8 non-empty lines

            String lower = line.toLowerCase();
            if (lower.startsWith("resume") || lower.startsWith("curriculum") || lower.startsWith("cv")
                    || lower.startsWith("profile") || lower.startsWith("page") || lower.startsWith("contact")
                    || lower.contains("@") || lower.contains("http") || lower.contains("www.") || lower.contains(".com")) {
                continue;
            }

            // Candidate names are typically 2 to 4 capitalized words (letters and spaces only)
            if (line.matches("^[A-Z][a-zA-Z.'-]{1,20}(\\s+[A-Z][a-zA-Z.'-]{1,20}){1,3}$")) {
                return line;
            }
        }
        return extractNameFromEmail(email);
    }

    private String extractNameFromEmail(String email) {
        if (email == null || !email.contains("@")) return "Candidate";
        String local = email.substring(0, email.indexOf('@'));
        String clean = local.replaceAll("[^a-zA-Z]+", " ").trim();
        if (clean.isBlank()) return "Candidate";
        return Arrays.stream(clean.split("\\s+"))
                .map(this::capitalize)
                .collect(Collectors.joining(" "));
    }

    public String extractEmail(String text) {
        if (text == null) return null;
        Matcher m = EMAIL_PATTERN.matcher(text);
        return m.find() ? m.group() : null;
    }

    public String extractPhone(String text) {
        if (text == null) return null;
        Matcher m = PHONE_PATTERN.matcher(text);
        return m.find() ? m.group().replaceAll("\\s+", " ").trim() : null;
    }

    public String extractLinkedIn(String text) {
        if (text == null) return null;
        Matcher m = LINKEDIN_PATTERN.matcher(text);
        return m.find() ? m.group() : null;
    }

    public String extractGitHub(String text) {
        if (text == null) return null;
        Matcher m = GITHUB_PATTERN.matcher(text);
        return m.find() ? m.group() : null;
    }

    public String extractDegree(String text) {
        if (text == null || text.isBlank()) return "Not explicitly specified";
        Matcher m = DEGREE_PATTERN.matcher(text);
        if (m.find()) {
            String degree = m.group(1).trim();
            String major = m.group(2) != null ? m.group(2).trim() : "";
            if (!major.isEmpty()) {
                major = major.split("(?i)\\s+(from|at|university|college|institute|cgpa|gpa|percentage|batch|class|with)\\b")[0].trim();
                major = major.split("\\r?\\n|\\.|,")[0].trim();
                if (!major.isBlank()) {
                    return degree + " in " + major;
                }
            }
            return degree;
        }
        return "Bachelor's / Professional Degree";
    }

    public int calculateWordCount(String text) {
        if (text == null || text.isBlank()) return 0;
        return text.trim().split("\\s+").length;
    }

    public List<String> extractDetectedSections(String norm) {
        List<String> sections = new ArrayList<>();
        if (norm.contains("@") || norm.contains("phone") || norm.contains("mobile") || norm.contains("+91")) {
            sections.add("Contact Information");
        }
        if (norm.contains("summary") || norm.contains("objective") || norm.contains("about me") || norm.contains("profile")) {
            sections.add("Professional Summary");
        }
        if (norm.contains("experience") || norm.contains("employment") || norm.contains("work history") || norm.contains("internship")) {
            sections.add("Work Experience");
        }
        if (norm.contains("skills") || norm.contains("technologies") || norm.contains("technical stack") || norm.contains("tools")) {
            sections.add("Technical Skills");
        }
        if (norm.contains("education") || norm.contains("degree") || norm.contains("university") || norm.contains("college") || norm.contains("academic")) {
            sections.add("Education");
        }
        if (norm.contains("projects") || norm.contains("portfolio")) {
            sections.add("Projects & Portfolio");
        }
        if (norm.contains("certifications") || norm.contains("certificates") || norm.contains("achievements") || norm.contains("honors")) {
            sections.add("Certifications & Achievements");
        }
        return sections;
    }

    public List<String> extractBullets(String text) {
        if (text == null) return Collections.emptyList();
        List<String> bullets = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");
        for (String raw : lines) {
            String line = raw.trim();
            if (line.length() < 20) continue;

            boolean startsWithBulletSymbol = raw.matches("^\\s*[•\\*\\-▪–—\u2022\u25E6\u25AA\u25B8\u2713\u2714|\\d+\\.]\\s*.*");
            String cleaned = line.replaceFirst("^[•\\*\\-▪–—\u2022\u25E6\u25AA\u25B8\u2713\u2714\\d+\\.\\s]+", "").trim();
            String[] words = cleaned.split("\\s+");

            if (words.length >= 4 && words.length <= 45) {
                String lower = cleaned.toLowerCase();

                // Filter out section headers and company/role title lines
                boolean isHeaderOrRole = lower.startsWith("education") || lower.startsWith("skills")
                        || lower.startsWith("experience") || lower.startsWith("professional")
                        || lower.contains("@") || lower.startsWith("university") || lower.startsWith("college")
                        || lower.contains("linkedin.com") || lower.contains("github.com")
                        || line.matches(".*\\(\\s*20\\d{2}\\s*[-–to]\\s*(?:20\\d{2}|present|current)\\s*\\).*")
                        || (line.contains(" at ") && (line.contains("20") || line.contains("19")));

                if (!isHeaderOrRole) {
                    if (startsWithBulletSymbol || isVerbStarting(cleaned)) {
                        bullets.add(cleaned);
                    }
                }
            }
        }
        return bullets;
    }

    private boolean isVerbStarting(String text) {
        return VERB_STARTING_PATTERN.matcher(text).matches();
    }

    public List<String> auditBullets(List<String> bullets, String targetRole) {
        List<String> audits = new ArrayList<>();

        for (String b : bullets) {
            if (audits.size() >= 3) break;

            boolean hasMetric = METRIC_PATTERN.matcher(b).find();
            boolean hasPassive = PASSIVE_PATTERN.matcher(b).find();

            if (hasPassive || !hasMetric) {
                String flaw;
                if (hasPassive && !hasMetric) {
                    flaw = "Passive phrasing detected ('" + extractMatchedPassive(b, PASSIVE_PATTERN) + "') + Zero quantifiable impact metrics.";
                } else if (hasPassive) {
                    flaw = "Diluted passive verb ('" + extractMatchedPassive(b, PASSIVE_PATTERN) + "') weakens recruiter impression of ownership.";
                } else {
                    flaw = "Lacks measurable numbers (no %, latency reduction, user volume, or efficiency scale).";
                }

                String rewrite = generateXyzRewrite(b, targetRole);
                audits.add("EXCERPT: \"" + truncate(b, 85) + "\" | FLAW: " + flaw + " | REWRITE: \"" + rewrite + "\"");
            }
        }

        if (audits.isEmpty() && !bullets.isEmpty()) {
            String b = bullets.get(0);
            audits.add("EXCERPT: \"" + truncate(b, 85) + "\" | FLAW: Strong baseline | REWRITE: \"" + generateXyzRewrite(b, targetRole) + "\"");
        }

        return audits;
    }

    private String extractMatchedPassive(String text, Pattern pattern) {
        Matcher m = pattern.matcher(text);
        return m.find() ? m.group() : "passive wording";
    }

    private String generateXyzRewrite(String bullet, String targetRole) {
        String lower = bullet.toLowerCase();
        if (lower.contains("api") || lower.contains("backend") || lower.contains("server") || lower.contains("endpoint") || lower.contains("service") || lower.contains("spring") || lower.contains("microservice")) {
            return "Architected scalable RESTful microservices using Spring Boot and PostgreSQL, decreasing API latency by 35% and supporting 50,000+ peak daily requests.";
        }
        if (lower.contains("front") || lower.contains("react") || lower.contains("ui") || lower.contains("ux") || lower.contains("component") || lower.contains("web") || lower.contains("page")) {
            return "Engineered responsive modular UI components in React & TypeScript, boosting page rendering speed by 42% and enhancing mobile user conversion by 18%.";
        }
        if (lower.contains("database") || lower.contains("sql") || lower.contains("query") || lower.contains("mongo") || lower.contains("redis") || lower.contains("schema")) {
            return "Optimized relational database schemas and indexed high-frequency queries in PostgreSQL, slashing query turnaround times from 2.5s to 160ms.";
        }
        if (lower.contains("test") || lower.contains("bug") || lower.contains("qa") || lower.contains("quality") || lower.contains("defect")) {
            return "Automated end-to-end integration and unit testing suites with JUnit and Mockito, expanding regression coverage to 88% and eliminating critical production regressions.";
        }
        if (lower.contains("deploy") || lower.contains("ci") || lower.contains("cd") || lower.contains("docker") || lower.contains("pipeline") || lower.contains("aws") || lower.contains("cloud") || lower.contains("build")) {
            return "Automated CI/CD deployment pipelines using Docker and GitHub Actions, shrinking build-and-release cycles from 45 minutes to under 7 minutes.";
        }
        if (lower.contains("team") || lower.contains("lead") || lower.contains("client") || lower.contains("agile") || lower.contains("scrum") || lower.contains("collaborat")) {
            return "Spearheaded sprint deliverables and cross-functional technical milestones across 6 engineers, launching 4 major features 2 weeks ahead of schedule.";
        }
        return "Spearheaded end-to-end implementation of core workflows for " + targetRole + ", boosting execution efficiency by 30% and maintaining 99.9% service uptime.";
    }

    private List<String> buildPersonalizedMistakes(List<String> bulletAudits, int metricMentions, String phone, String linkedin, String github, int wordCount, List<String> sections, String degree, List<String> missingKeywords, String role) {
        List<String> mistakes = new ArrayList<>();

        // Bullet Point Issues
        for (String audit : bulletAudits) {
            if (audit.contains("FLAW:") && !audit.contains("Strong baseline")) {
                int flawIdx = audit.indexOf("FLAW: ");
                int rewriteIdx = audit.indexOf(" | REWRITE:");
                if (flawIdx != -1 && rewriteIdx != -1) {
                    String excerpt = audit.substring(audit.indexOf("EXCERPT: ") + 9, audit.indexOf(" | FLAW:"));
                    String flaw = audit.substring(flawIdx + 6, rewriteIdx);
                    mistakes.add("Bullet Point Issue: " + excerpt + " -- " + flaw);
                }
            }
        }

        // Metric density
        if (metricMentions == 0) {
            mistakes.add("Zero Measurable Metrics: Your experience bullets lack quantified figures (e.g., %, $, latency in ms, user volume). Recruiters prioritize results over task lists.");
        } else if (metricMentions < 3) {
            mistakes.add("Low Metric Density: Only " + metricMentions + " quantified achievement(s) detected across your resume. Top-tier candidates average 4-6 metrics.");
        }

        // Contact info
        if (phone == null) {
            mistakes.add("Missing Phone Number: Recruiter telephone number was not found in your contact header.");
        }
        if (linkedin == null) {
            mistakes.add("Missing LinkedIn URL: No LinkedIn profile detected. 87% of recruiters cross-check candidate LinkedIn profiles.");
        }
        if (github == null && (role.toLowerCase().contains("engineer") || role.toLowerCase().contains("developer"))) {
            mistakes.add("Missing GitHub / Code Portfolio: For software engineering roles, omitting a GitHub link prevents technical reviewers from evaluating code quality.");
        }

        // Word count
        if (wordCount < 300) {
            mistakes.add("Resume Too Brief (" + wordCount + " words): An industry-standard single-page resume contains 450-700 words. Critical project scope and skills are missing.");
        } else if (wordCount > 1050) {
            mistakes.add("Resume Wordiness (" + wordCount + " words): Overly lengthy resumes risk lower ATS parser retention and recruiter fatigue. Recommended: 500-800 words.");
        }

        // Missing sections
        if (!sections.contains("Professional Summary")) {
            mistakes.add("Missing Professional Summary: Resume lacks an opening 3-sentence summary highlighting your core tech stack, years of experience, and primary career impact.");
        }
        if (degree.contains("Not explicitly specified")) {
            mistakes.add("Degree Ambiguity: ATS could not parse a recognized degree (e.g. B.Tech, B.E., MCA, BS) in your Education section.");
        }

        // Missing keywords
        if (!missingKeywords.isEmpty()) {
            mistakes.add("Missing Core Role Keywords: The following high-frequency technologies for " + role + " were not detected: " + String.join(", ", missingKeywords.stream().limit(4).toList()) + ".");
        }

        return mistakes;
    }

    private List<String> buildPersonalizedImprovements(List<String> bulletAudits, List<String> missingKeywords, String phone, String linkedin, String github, List<String> sections, String role) {
        List<String> improvements = new ArrayList<>();

        if (!bulletAudits.isEmpty()) {
            improvements.add("Adopt Google's XYZ Formula ('Accomplished [X] as measured by [Y], by doing [Z]') across your experience bullets (see Line-by-Line Bullet Audits below for custom rewrites).");
        }

        if (!missingKeywords.isEmpty()) {
            improvements.add("Integrate high-demand industry skills into your Technical Skills matrix: [" + String.join(", ", missingKeywords.stream().limit(5).toList()) + "].");
        }

        improvements.add("Replace passive phrasing ('worked on', 'responsible for') with proactive power verbs: 'Architected', 'Spearheaded', 'Optimized', 'Automated', 'Engineered'.");

        if (phone == null || linkedin == null || github == null) {
            improvements.add("Complete your contact header: Add a direct mobile number, clean clickable LinkedIn profile (linkedin.com/in/...), and GitHub repository link.");
        }

        if (!sections.contains("Professional Summary")) {
            improvements.add("Add a 3-line Executive Summary: Highlight your exact target title (" + role + "), total years of experience, core tech stack, and primary career achievement.");
        }

        improvements.add("Preserve single-column ATS hierarchy: Use standard section titles ('Professional Experience', 'Technical Skills', 'Education') without multi-column tables or nested textboxes.");

        return improvements;
    }

    public Set<String> extractCatalogSkillsFromText(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        String lower = text.toLowerCase();
        Set<String> matched = new LinkedHashSet<>();
        for (Map.Entry<String, String> entry : SKILL_CATALOG.entrySet()) {
            String kw = entry.getKey();
            if (kw.length() <= 3) {
                Pattern p = SHORT_KEYWORD_PATTERNS.get(kw);
                if (p != null && p.matcher(lower).find()) {
                    matched.add(entry.getValue());
                }
            } else {
                if (lower.contains(kw)) {
                    matched.add(entry.getValue());
                }
            }
        }
        return matched;
    }

    private boolean containsSkillMatch(String normResume, Set<String> catalogSkills, String skill) {
        String lowerSkill = skill.toLowerCase();
        if (normResume.contains(lowerSkill)) return true;
        for (String cs : catalogSkills) {
            if (cs.equalsIgnoreCase(skill)) return true;
        }
        return false;
    }

    private Set<String> getExpectedSkillsForRole(String role) {
        String lower = role.toLowerCase();
        Set<String> expected = new LinkedHashSet<>();
        if (lower.contains("full stack") || lower.contains("web")) {
            expected.addAll(List.of("React.js", "Node.js", "Java", "Spring Boot", "TypeScript", "RESTful APIs", "Docker", "SQL", "Git", "PostgreSQL"));
        } else if (lower.contains("java") || lower.contains("backend")) {
            expected.addAll(List.of("Java", "Spring Boot", "RESTful APIs", "Microservices", "PostgreSQL", "MySQL", "Docker", "Apache Kafka", "Redis", "Hibernate", "JUnit"));
        } else if (lower.contains("react") || lower.contains("front")) {
            expected.addAll(List.of("React.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Redux", "RESTful APIs", "Git", "Next.js"));
        } else if (lower.contains("devops") || lower.contains("cloud")) {
            expected.addAll(List.of("AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Jenkins", "GitHub Actions", "Prometheus", "Git"));
        } else if (lower.contains("data") || lower.contains("ai") || lower.contains("ml")) {
            expected.addAll(List.of("Python", "Machine Learning", "Pandas", "NumPy", "SQL", "TensorFlow", "PyTorch", "Apache Spark", "Git"));
        } else {
            expected.addAll(List.of("Java", "Python", "SQL", "RESTful APIs", "Git", "Docker", "Data Structures & Algorithms", "Microservices", "PostgreSQL"));
        }
        return expected;
    }

    private String targetRoleOrJob(String title) {
        return (title != null && !title.isBlank()) ? title : "Software Engineer";
    }

    private String synthesizeCandidateText(CandidateProfile profile) {
        StringBuilder sb = new StringBuilder();
        if (profile.getBio() != null) sb.append(profile.getBio()).append(" ");
        if (profile.getHeadline() != null) sb.append(profile.getHeadline()).append(" ");
        if (profile.getSkills() != null) {
            for (CandidateSkill cs : profile.getSkills()) {
                if (cs.getSkill() != null && cs.getSkill().getName() != null) {
                    sb.append(cs.getSkill().getName()).append(" ");
                }
            }
        }
        if (profile.getExperiences() != null) {
            for (Experience exp : profile.getExperiences()) {
                sb.append(exp.getJobTitle()).append(" ").append(exp.getCompanyName()).append(" ");
                if (exp.getDescription() != null) sb.append(exp.getDescription()).append(" ");
            }
        }
        return sb.toString();
    }

    public int extractYearsFromResume(String text) {
        Matcher m = EXP_YEARS_PATTERN.matcher(text);
        int max = 0;
        while (m.find()) {
            try {
                int y = Integer.parseInt(m.group(1));
                if (y > max && y <= 35) max = y;
            } catch (Exception ignored) {}
        }
        return max;
    }

    private int countMatches(String text, Pattern pattern) {
        Matcher m = pattern.matcher(text);
        int count = 0;
        while (m.find()) count++;
        return count;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        if (s.length() <= max) return s;
        return s.substring(0, max) + "...";
    }
}
