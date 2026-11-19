package com.talentflow.backend.service;

import com.talentflow.backend.document.AtsAnalysisDocument;
import com.talentflow.backend.dto.application.ApplicationResponse;
import com.talentflow.backend.dto.application.ApplicationStatusHistoryResponse;
import com.talentflow.backend.dto.application.ApplyJobRequest;
import com.talentflow.backend.dto.application.ConstructiveFeedbackResponse;
import com.talentflow.backend.dto.application.UpdateApplicationStatusRequest;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ApiException;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final ProfileService profileService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AtsResumeAnalyzerService atsResumeAnalyzerService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationStatusHistoryRepository historyRepository,
                              JobRepository jobRepository,
                              ResumeRepository resumeRepository,
                              ProfileService profileService,
                              EmailService emailService,
                              NotificationService notificationService,
                              AtsResumeAnalyzerService atsResumeAnalyzerService) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.profileService = profileService;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.atsResumeAnalyzerService = atsResumeAnalyzerService;
    }

    @Transactional
    public ApplicationResponse applyForJob(String candidateEmail, ApplyJobRequest request) {
        String cleanEmail = candidateEmail.toLowerCase().trim();

        // 1. Check duplicate application
        if (applicationRepository.existsByJobIdAndCandidateProfileUserEmail(request.getJobId(), cleanEmail)) {
            throw new ApiException("You have already submitted an application for this vacancy.", HttpStatus.CONFLICT);
        }

        // 2. Fetch Job
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", request.getJobId()));

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new ApiException("This job vacancy is no longer accepting new applications.", HttpStatus.BAD_REQUEST);
        }

        // 3. Fetch Candidate Profile
        CandidateProfile candidateProfile = profileService.getOrCreateCandidateProfileEntity(cleanEmail);
        User user = candidateProfile.getUser();

        // 4. Resolve Resume
        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId()).orElse(null);
        }
        if (resume == null && !candidateProfile.getResumes().isEmpty()) {
            resume = candidateProfile.getResumes().stream()
                    .filter(Resume::isPrimary)
                    .findFirst()
                    .orElse(candidateProfile.getResumes().get(0));
        }

        // 5. Build Application
        Application application = new Application(job, candidateProfile, resume, request.getCoverLetter());

        String candidateName = request.getCandidateName();
        if (candidateName == null || candidateName.isBlank()) {
            candidateName = (user.getFirstName() + " " + user.getLastName()).trim();
        }
        application.setCandidateName(candidateName);
        application.setCandidateEmail(cleanEmail);

        String phone = request.getCandidatePhone();
        if (phone == null || phone.isBlank()) {
            phone = user.getPhone();
        }
        application.setCandidatePhone(phone);

        Double currentCtc = request.getCurrentCtcLpa();
        if (currentCtc == null && candidateProfile.getCurrentSalary() != null) {
            currentCtc = candidateProfile.getCurrentSalary() >= 100000
                    ? candidateProfile.getCurrentSalary() / 100000
                    : candidateProfile.getCurrentSalary();
        }
        application.setCurrentCtcLpa(currentCtc);

        Double expectedCtc = request.getExpectedCtcLpa();
        if (expectedCtc == null && candidateProfile.getExpectedSalary() != null) {
            expectedCtc = candidateProfile.getExpectedSalary() >= 100000
                    ? candidateProfile.getExpectedSalary() / 100000
                    : candidateProfile.getExpectedSalary();
        }
        application.setExpectedCtcLpa(expectedCtc);

        // 6. Save Application first to obtain generated ID for foreign/document linking
        Application savedApp = applicationRepository.save(application);

        // 7. AI ATS Resume Analysis & Scoring (stored in MongoDB with persistent applicationId)
        try {
            com.talentflow.backend.document.AtsAnalysisDocument atsDoc = atsResumeAnalyzerService.analyzeAndSave(savedApp, job, resume);
            if (atsDoc != null) {
                savedApp.setAtsScore(atsDoc.getAtsScore());
                savedApp.setAtsMatchTier(atsDoc.getMatchTier());
                savedApp = applicationRepository.save(savedApp);
            }
        } catch (Exception ex) {
            log.warn("AI ATS Resume analysis failed during application submit: {}", ex.getMessage());
        }

        // 8. Increment Job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        // 7. Audit status history
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                savedApp,
                null,
                ApplicationStatus.APPLIED,
                cleanEmail,
                "Application submitted successfully via TalentFlow portal"
        );
        historyRepository.save(history);

        // 8. Dispatch Email Confirmation to Candidate Inbox
        String companyName = job.getCompany() != null ? job.getCompany().getName() : "TalentFlow Enterprise";
        emailService.sendApplicationConfirmationEmail(cleanEmail, candidateName, job.getTitle(), companyName);

        // 9. Dispatch in-app notifications
        try {
            notificationService.createNotification(
                    cleanEmail,
                    "Application Submitted Successfully",
                    "Your application for " + job.getTitle() + " at " + companyName + " has been recorded in the TalentFlow ATS.",
                    NotificationType.APPLICATION_STATUS_UPDATED,
                    "#candidate-hub",
                    "jobId=" + job.getId()
            );

            if (job.getPostedBy() != null && job.getPostedBy().getEmail() != null) {
                notificationService.createNotification(
                        job.getPostedBy().getEmail(),
                        "New Applicant: " + candidateName,
                        candidateName + " applied for " + job.getTitle() + " at " + companyName + ".",
                        NotificationType.JOB_APPLICATION_RECEIVED,
                        "#recruiter-hub",
                        "appId=" + savedApp.getId()
                );

                // Dispatch email to recruiter
                try {
                    emailService.sendRecruiterNewApplicationEmail(
                            job.getPostedBy().getEmail(),
                            job.getPostedBy().getFullName(),
                            candidateName,
                            job.getTitle(),
                            companyName,
                            savedApp.getId()
                    );
                } catch (Exception ex) {
                    log.warn("Failed to dispatch recruiter email notification: {}", ex.getMessage());
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to dispatch in-app notification on application submit: {}", ex.getMessage());
        }

        log.info("Application #{} submitted by {} for '{}' at '{}'",
                savedApp.getId(), cleanEmail, job.getTitle(), companyName);

        return toResponse(savedApp);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getCandidateApplications(String candidateEmail) {
        String cleanEmail = candidateEmail.toLowerCase().trim();
        return applicationRepository.findByCandidateProfileUserEmailOrderByAppliedAtDesc(cleanEmail)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getJobApplications(Long jobId) {
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String actorEmail, UpdateApplicationStatusRequest req) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        ApplicationStatus oldStatus = app.getStatus();
        ApplicationStatus newStatus = req.getStatus();

        if (oldStatus != newStatus) {
            app.setStatus(newStatus);
            if (req.getRejectionReason() != null) {
                app.setRejectionReason(req.getRejectionReason());
            }
            if (req.getRemarks() != null) {
                app.setNotes(req.getRemarks());
            }
            Application saved = applicationRepository.save(app);

            ApplicationStatusHistory history = new ApplicationStatusHistory(
                    saved,
                    oldStatus,
                    newStatus,
                    actorEmail,
                    req.getRemarks() != null ? req.getRemarks() : "Status progressed to " + newStatus
            );
            historyRepository.save(history);

            log.info("Application #{} status updated from {} to {} by {}",
                    applicationId, oldStatus, newStatus, actorEmail);

            // Notify candidate of stage progression via email
            String candidateEmail = saved.getCandidateEmail();
            if (candidateEmail != null && !candidateEmail.isBlank()) {
                String candidateName = saved.getCandidateName();
                String jobTitle = saved.getJob() != null ? saved.getJob().getTitle() : "Position";
                String companyName = (saved.getJob() != null && saved.getJob().getCompany() != null)
                        ? saved.getJob().getCompany().getName()
                        : "TalentFlow Enterprise";
                try {
                    if (newStatus == ApplicationStatus.OFFER_RELEASED) {
                        Double offeredSalary = saved.getExpectedCtcLpa() != null
                                ? saved.getExpectedCtcLpa()
                                : (saved.getJob() != null ? saved.getJob().getMaxSalary() : null);
                        emailService.sendOfferLetterEmail(
                                candidateEmail,
                                candidateName,
                                jobTitle,
                                companyName,
                                offeredSalary,
                                "Immediate / As agreed",
                                req.getRemarks()
                        );
                    } else if (newStatus == ApplicationStatus.REJECTED) {
                        emailService.sendApplicationRejectionEmail(
                                candidateEmail,
                                candidateName,
                                jobTitle,
                                companyName,
                                req.getRemarks()
                        );
                    } else {
                        emailService.sendApplicationStatusUpdateEmail(
                                candidateEmail,
                                candidateName,
                                jobTitle,
                                companyName,
                                newStatus.name(),
                                req.getRemarks()
                        );
                    }
                } catch (Exception ex) {
                    log.warn("Failed to dispatch status update email: {}", ex.getMessage());
                }

                // Dispatch in-app notification for candidate
                try {
                    String notifTitle;
                    String notifMsg;
                    NotificationType notifType = NotificationType.APPLICATION_STATUS_UPDATED;

                    switch (newStatus) {
                        case SHORTLISTED -> {
                            notifTitle = "Application Shortlisted! 🎉";
                            notifMsg = "Great news! " + companyName + " has shortlisted your application for " + jobTitle + ".";
                        }
                        case TECH_INTERVIEW -> {
                            notifTitle = "Technical Interview Stage 💻";
                            notifMsg = "Your application for " + jobTitle + " at " + companyName + " has progressed to Technical Interview.";
                            notifType = NotificationType.INTERVIEW_SCHEDULED;
                        }
                        case HR_INTERVIEW -> {
                            notifTitle = "HR Interview Round 🤝";
                            notifMsg = "You have progressed to the HR Review stage for " + jobTitle + " at " + companyName + ".";
                            notifType = NotificationType.INTERVIEW_SCHEDULED;
                        }
                        case SELECTED -> {
                            notifTitle = "Candidate Selected! ⭐";
                            notifMsg = "Congratulations! You have been selected for " + jobTitle + " at " + companyName + ".";
                        }
                        case OFFER_RELEASED -> {
                            notifTitle = "Offer Letter Released! 📜";
                            notifMsg = "Celebrations! " + companyName + " has rolled out a formal offer for " + jobTitle + ".";
                            notifType = NotificationType.OFFER_RELEASED;
                        }
                        case HIRED -> {
                            notifTitle = "Welcome to the Team! 🎉";
                            notifMsg = "You are officially hired as " + jobTitle + " at " + companyName + "!";
                            notifType = NotificationType.OFFER_RELEASED;
                        }
                        case REJECTED -> {
                            notifTitle = "Application Update: " + jobTitle;
                            notifMsg = "Thank you for interviewing with " + companyName + ". The team has decided to proceed with other candidates.";
                        }
                        default -> {
                            notifTitle = "Application Status: " + newStatus;
                            notifMsg = "Your application for " + jobTitle + " at " + companyName + " is now in " + newStatus + " stage.";
                        }
                    }

                    notificationService.createNotification(
                            candidateEmail,
                            notifTitle,
                            notifMsg,
                            notifType,
                            "#candidate-hub",
                            "appId=" + saved.getId()
                    );
                } catch (Exception ex) {
                    log.warn("Failed to dispatch in-app status notification: {}", ex.getMessage());
                }
            }

            return toResponse(saved);
        }

        return toResponse(app);
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistoryResponse> getApplicationHistory(Long applicationId, String requestingEmail) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        return historyRepository.findByApplicationIdOrderByChangedAtAsc(applicationId).stream()
                .map(h -> new ApplicationStatusHistoryResponse(
                        h.getId(),
                        app.getId(),
                        h.getOldStatus(),
                        h.getNewStatus(),
                        h.getChangedBy(),
                        h.getRemarks(),
                        h.getChangedAt()
                ))
                .collect(Collectors.toList());
    }

    private ApplicationResponse toResponse(Application app) {
        ApplicationResponse dto = new ApplicationResponse();
        dto.setId(app.getId());

        Job job = app.getJob();
        if (job != null) {
            dto.setJobId(job.getId());
            dto.setJobTitle(job.getTitle());
            dto.setLocation(job.getLocation());
            dto.setWorkplaceType(job.getWorkplaceType());
            dto.setEmploymentType(job.getEmploymentType());
            dto.setMinSalary(job.getMinSalary());
            dto.setMaxSalary(job.getMaxSalary());
            dto.setCurrency(job.getCurrency());
            if (job.getCompany() != null) {
                dto.setCompanyId(job.getCompany().getId());
                dto.setCompanyName(job.getCompany().getName());
                dto.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            }
        }

        dto.setStatus(app.getStatus());
        if (app.getCandidateProfile() != null) {
            dto.setCandidateProfileId(app.getCandidateProfile().getId());
        }
        dto.setCandidateName(app.getCandidateName());
        dto.setCandidateEmail(app.getCandidateEmail());
        dto.setCandidatePhone(app.getCandidatePhone());
        dto.setCurrentCtcLpa(app.getCurrentCtcLpa());
        dto.setExpectedCtcLpa(app.getExpectedCtcLpa());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setRejectionReason(app.getRejectionReason());
        dto.setAtsScore(app.getAtsScore());
        dto.setAtsMatchTier(app.getAtsMatchTier());

        Resume resume = app.getResume();
        if (resume != null) {
            dto.setResumeId(resume.getId());
            dto.setResumeTitle(resume.getTitle());
            dto.setResumeUrl(resume.getFilePath());
        }

        dto.setAppliedAt(app.getAppliedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        return dto;
    }

    @Transactional
    public ConstructiveFeedbackResponse getConstructiveFeedback(Long applicationId, String requestingEmail) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        // Security check
        String candidateEmail = app.getCandidateEmail();
        String recruiterEmail = (app.getJob() != null && app.getJob().getPostedBy() != null)
                ? app.getJob().getPostedBy().getEmail() : null;

        boolean isAuthorized = (candidateEmail != null && candidateEmail.equalsIgnoreCase(requestingEmail)) ||
                               (recruiterEmail != null && recruiterEmail.equalsIgnoreCase(requestingEmail));

        if (!isAuthorized) {
            throw new AccessDeniedException("You are not authorized to view this feedback report");
        }

        AtsAnalysisDocument analysis = null;
        if (atsResumeAnalyzerService != null) {
            analysis = atsResumeAnalyzerService.getAnalysisByApplicationId(applicationId).orElse(null);
            if (analysis == null && app.getJob() != null) {
                analysis = atsResumeAnalyzerService.analyzeAndSave(app, app.getJob(), app.getResume());
            }
        }

        ConstructiveFeedbackResponse res = new ConstructiveFeedbackResponse();
        res.setApplicationId(app.getId());
        res.setApplicationStatus(app.getStatus().name());
        res.setCandidateName(app.getCandidateName() != null ? app.getCandidateName() : "Candidate");

        if (app.getJob() != null) {
            res.setJobId(app.getJob().getId());
            res.setJobTitle(app.getJob().getTitle());
            if (app.getJob().getCompany() != null) {
                res.setCompanyName(app.getJob().getCompany().getName());
            } else {
                res.setCompanyName("Hiring Organization");
            }
        } else {
            res.setJobTitle("Software Position");
            res.setCompanyName("Hiring Organization");
        }

        double score = (analysis != null) ? analysis.getAtsScore() : (app.getAtsScore() != null ? app.getAtsScore() : 72.0);
        String tier = (analysis != null && analysis.getMatchTier() != null)
                ? analysis.getMatchTier()
                : (app.getAtsMatchTier() != null ? app.getAtsMatchTier() : "GOOD_MATCH");

        res.setAtsScore(score);
        res.setMatchTier(tier);

        List<String> strengths = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        List<String> resumeTips = new ArrayList<>();

        if (analysis != null) {
            if (analysis.getTopStrengths() != null) strengths.addAll(analysis.getTopStrengths());
            if (analysis.getMissingKeywords() != null) missing.addAll(analysis.getMissingKeywords());
            if (analysis.getImprovements() != null) resumeTips.addAll(analysis.getImprovements());
            if (resumeTips.isEmpty() && analysis.getMistakes() != null) {
                resumeTips.addAll(analysis.getMistakes());
            }
        }

        if (strengths.isEmpty()) {
            strengths.add("Solid educational foundation and core competencies verified");
            strengths.add("Structured experience progression with relevant domain exposure");
            strengths.add("Active initiative and verified candidate profile completeness");
        }

        if (missing.isEmpty()) {
            missing.add("Distributed Systems & Microservices Architecture");
            missing.add("Container Orchestration (Docker / Kubernetes)");
            missing.add("Cloud Infrastructure & CI/CD Pipelines");
        }

        if (resumeTips.isEmpty()) {
            resumeTips.add("Quantify project impact with metrics (e.g. 'Improved API latency by 35% across 250k daily active users').");
            resumeTips.add("Lead bullet points with high-impact engineering action verbs (Architected, Spearheaded, Refactored).");
            resumeTips.add("Align technical skill keywords precisely with the job description taxonomy.");
        }

        res.setIdentifiedStrengths(strengths);
        res.setCriticalSkillGaps(missing);
        res.setResumeOptimizationTips(resumeTips);

        // Build 3 personalized action steps
        List<String> actions = new ArrayList<>();
        String topGap = missing.get(0);
        String secondGap = (missing.size() > 1) ? missing.get(1) : "Cloud Deployment";

        actions.add("Build a Capstone Project: Create a production-ready application featuring " + topGap + " and " + secondGap + " with unit tests, Dockerfile, and live demo link on GitHub.");
        actions.add("Deepen Architecture & Scale: Practice system design patterns addressing high-throughput messaging, caching strategies, and data consistency.");
        actions.add("Targeted Resume Re-alignment: Highlight quantifiable business metrics and relevant keywords in your top 3 experience bullet points before your next submission.");
        res.setRecommendedActionPlan(actions);

        // Constructive Summary
        String reason = (app.getRejectionReason() != null && !app.getRejectionReason().isBlank())
                ? " Recruiter feedback noted: \"" + app.getRejectionReason() + "\"."
                : "";
        res.setConstructiveSummary(
                "Thank you for your application to " + res.getJobTitle() + " at " + res.getCompanyName() + ". " +
                "Your profile demonstrated strong capabilities in core areas, achieving an ATS compatibility rating of " +
                String.format("%.1f", score) + "% (" + tier.replace("_", " ") + "). " +
                "For this particular opening, the hiring committee advanced candidates who exhibited deeper applied ownership in " +
                topGap + " and " + secondGap + "." + reason
        );

        res.setEncouragementNote(
                "Career development is an iterative journey. Bridging these specific competencies will make your profile stand out as a premier contender in upcoming hiring waves."
        );

        return res;
    }
}

