package com.talentflow.backend.service;

import com.talentflow.backend.dto.interview.InterviewResponse;
import com.talentflow.backend.dto.interview.ScheduleInterviewRequest;
import com.talentflow.backend.dto.interview.SubmitFeedbackRequest;
import com.talentflow.backend.dto.interview.UpdateInterviewStatusRequest;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ApiException;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public InterviewService(InterviewRepository interviewRepository,
                            ApplicationRepository applicationRepository,
                            ApplicationStatusHistoryRepository historyRepository,
                            UserRepository userRepository,
                            JobRepository jobRepository,
                            EmailService emailService,
                            NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Transactional
    public InterviewResponse scheduleInterview(String recruiterEmail, ScheduleInterviewRequest request) {
        User recruiter = userRepository.findByEmail(recruiterEmail.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        Job job = application.getJob();
        User candidate = application.getCandidateProfile().getUser();

        // Generate meeting link if not supplied
        String meetingLink = request.getMeetingLink();
        if (meetingLink == null || meetingLink.isBlank()) {
            String roomCode = UUID.randomUUID().toString().substring(0, 8);
            meetingLink = "https://meet.google.com/tf360-" + roomCode;
        }

        Interview interview = new Interview(
                application,
                job,
                candidate,
                recruiter,
                request.getRoundName(),
                request.getInterviewType() != null ? request.getInterviewType() : InterviewType.TECH_ROUND_1,
                request.getMeetingMode() != null ? request.getMeetingMode() : MeetingMode.GOOGLE_MEET,
                meetingLink,
                request.getScheduledStartTime(),
                request.getScheduledEndTime(),
                request.getInterviewerName() != null ? request.getInterviewerName() : recruiter.getFullName(),
                request.getInterviewerEmail() != null ? request.getInterviewerEmail() : recruiter.getEmail(),
                request.getInstructions()
        );

        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            interview.setTimezone(request.getTimezone());
        }

        Interview savedInterview = interviewRepository.save(interview);

        // Advance application stage if in early pipeline
        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus targetStatus = (request.getInterviewType() == InterviewType.HR_ROUND)
                ? ApplicationStatus.HR_INTERVIEW
                : ApplicationStatus.TECH_INTERVIEW;

        if (oldStatus == ApplicationStatus.APPLIED || oldStatus == ApplicationStatus.UNDER_REVIEW || oldStatus == ApplicationStatus.SHORTLISTED) {
            application.setStatus(targetStatus);
            applicationRepository.save(application);

            ApplicationStatusHistory history = new ApplicationStatusHistory(
                    application,
                    oldStatus,
                    targetStatus,
                    recruiter.getFullName() + " (Recruiter)",
                    "Scheduled " + request.getRoundName()
            );
            historyRepository.save(history);
        }

        // Dispatch live email invitation
        try {
            emailService.sendInterviewInvitationEmail(savedInterview);
        } catch (Exception ex) {
            log.warn("Failed to dispatch interview invitation email: {}", ex.getMessage());
        }

        // Dispatch in-app notifications
        try {
            String jobTitle = job != null ? job.getTitle() : "Position";
            String companyName = (job != null && job.getCompany() != null) ? job.getCompany().getName() : "TalentFlow Enterprise";

            notificationService.createNotification(
                    candidate.getEmail(),
                    "Interview Scheduled: " + savedInterview.getRoundName(),
                    "You are scheduled for " + savedInterview.getRoundName() + " (" + jobTitle + " at " + companyName + ") via " + savedInterview.getMeetingMode() + ".",
                    com.talentflow.backend.entity.NotificationType.INTERVIEW_SCHEDULED,
                    "#candidate-hub",
                    "interviewId=" + savedInterview.getId()
            );

            notificationService.createNotification(
                    recruiter.getEmail(),
                    "Interview Scheduled: " + candidate.getFullName(),
                    "Confirmed " + savedInterview.getRoundName() + " for " + jobTitle + " with " + candidate.getFullName() + ".",
                    com.talentflow.backend.entity.NotificationType.INTERVIEW_SCHEDULED,
                    "#recruiter-hub",
                    "interviewId=" + savedInterview.getId()
            );
        } catch (Exception ex) {
            log.warn("Failed to dispatch in-app notification on interview schedule: {}", ex.getMessage());
        }

        return toResponse(savedInterview);
    }

    @Transactional(readOnly = true)
    public InterviewResponse getInterviewById(Long id, String currentUserEmail) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));
        return toResponse(interview);
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByApplication(Long applicationId, String currentUserEmail) {
        return interviewRepository.findByApplicationIdOrderByScheduledStartTimeDesc(applicationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForCandidate(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", candidateEmail));

        return interviewRepository.findByCandidateIdOrderByScheduledStartTimeDesc(candidate.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForRecruiter(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        return interviewRepository.findByRecruiterIdOrderByScheduledStartTimeDesc(recruiter.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse updateInterviewStatus(Long interviewId, String userEmail, UpdateInterviewStatusRequest request) {
        User user = userRepository.findByEmail(userEmail.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        interview.setStatus(request.getStatus());
        if (request.getRescheduleReason() != null && !request.getRescheduleReason().isBlank()) {
            interview.setRescheduleReason(request.getRescheduleReason());
        }
        if (request.getCandidateNotes() != null && !request.getCandidateNotes().isBlank()) {
            interview.setCandidateNotes(request.getCandidateNotes());
        }

        Interview saved = interviewRepository.save(interview);

        // Notify parties via email
        try {
            emailService.sendInterviewStatusUpdateEmail(saved, user.getFullName());
        } catch (Exception ex) {
            log.warn("Failed to dispatch status update email: {}", ex.getMessage());
        }

        // Notify parties via in-app notification
        try {
            String jobTitle = saved.getJob() != null ? saved.getJob().getTitle() : "Role";
            if (saved.getCandidate() != null && saved.getCandidate().getEmail() != null) {
                notificationService.createNotification(
                        saved.getCandidate().getEmail(),
                        "Interview Status: " + saved.getStatus(),
                        "Your interview for " + saved.getRoundName() + " (" + jobTitle + ") is now " + saved.getStatus() + ".",
                        com.talentflow.backend.entity.NotificationType.INTERVIEW_RESCHEDULED,
                        "#candidate-hub",
                        "interviewId=" + saved.getId()
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to dispatch in-app notification on status change: {}", ex.getMessage());
        }

        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse submitFeedback(Long interviewId, String recruiterEmail, SubmitFeedbackRequest request) {
        User recruiter = userRepository.findByEmail(recruiterEmail.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        interview.setTechnicalRating(request.getTechnicalRating());
        interview.setProblemSolvingRating(request.getProblemSolvingRating());
        interview.setCommunicationRating(request.getCommunicationRating());
        interview.setCulturalFitRating(request.getCulturalFitRating());

        double avg = (request.getTechnicalRating() + request.getProblemSolvingRating()
                + request.getCommunicationRating() + request.getCulturalFitRating()) / 4.0;
        interview.setOverallRating(Math.round(avg * 10.0) / 10.0);

        interview.setRecommendation(request.getRecommendation());
        interview.setInterviewerFeedback(request.getInterviewerFeedback());
        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setFeedbackSubmittedAt(Instant.now());

        Interview saved = interviewRepository.save(interview);

        // If candidate scored STRONG_HIRE or HIRE, optionally advance pipeline status
        Application application = saved.getApplication();
        if (application != null) {
            ApplicationStatus oldStatus = application.getStatus();
            ApplicationStatus newStatus = oldStatus;

            if (request.getRecommendation() == RecommendationType.STRONG_HIRE || request.getRecommendation() == RecommendationType.HIRE) {
                if (oldStatus == ApplicationStatus.TECH_INTERVIEW) {
                    newStatus = ApplicationStatus.HR_INTERVIEW;
                } else if (oldStatus == ApplicationStatus.HR_INTERVIEW) {
                    newStatus = ApplicationStatus.SELECTED;
                }
            } else if (request.getRecommendation() == RecommendationType.NO_HIRE) {
                // Keep status or let recruiter manually decide, but record history
            }

            if (newStatus != oldStatus) {
                application.setStatus(newStatus);
                applicationRepository.save(application);

                ApplicationStatusHistory history = new ApplicationStatusHistory(
                        application,
                        oldStatus,
                        newStatus,
                        recruiter.getFullName() + " (Scorecard Evaluator)",
                        "Scorecard submitted: " + request.getRecommendation() + " (Rating: " + saved.getOverallRating() + "/5)"
                );
                historyRepository.save(history);
            }
        }

        try {
            emailService.sendInterviewFeedbackEmail(saved);
        } catch (Exception ex) {
            log.warn("Failed to dispatch feedback notification: {}", ex.getMessage());
        }

        // Dispatch in-app notifications
        try {
            String jobTitle = saved.getJob() != null ? saved.getJob().getTitle() : "Role";
            if (saved.getCandidate() != null && saved.getCandidate().getEmail() != null) {
                notificationService.createNotification(
                        saved.getCandidate().getEmail(),
                        "Interview Feedback Submitted",
                        "Your interview scorecard for " + saved.getRoundName() + " (" + jobTitle + ") has been submitted.",
                        com.talentflow.backend.entity.NotificationType.INTERVIEW_FEEDBACK_SUBMITTED,
                        "#candidate-hub",
                        "interviewId=" + saved.getId()
                );
            }

            if (saved.getRecruiter() != null && saved.getRecruiter().getEmail() != null) {
                notificationService.createNotification(
                        saved.getRecruiter().getEmail(),
                        "Scorecard Logged: " + (saved.getCandidate() != null ? saved.getCandidate().getFullName() : "Candidate"),
                        "Overall Score: " + saved.getOverallRating() + "/5.0 | Recommendation: " + saved.getRecommendation() + ".",
                        com.talentflow.backend.entity.NotificationType.INTERVIEW_FEEDBACK_SUBMITTED,
                        "#recruiter-hub",
                        "interviewId=" + saved.getId()
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to dispatch in-app feedback notification: {}", ex.getMessage());
        }

        return toResponse(saved);
    }

    public InterviewResponse toResponse(Interview interview) {
        InterviewResponse dto = new InterviewResponse();
        dto.setId(interview.getId());

        if (interview.getApplication() != null) {
            dto.setApplicationId(interview.getApplication().getId());
        }

        if (interview.getJob() != null) {
            dto.setJobId(interview.getJob().getId());
            dto.setJobTitle(interview.getJob().getTitle());
            if (interview.getJob().getCompany() != null) {
                dto.setCompanyId(interview.getJob().getCompany().getId());
                dto.setCompanyName(interview.getJob().getCompany().getName());
                dto.setCompanyLogoUrl(interview.getJob().getCompany().getLogoUrl());
            }
        }

        if (interview.getCandidate() != null) {
            dto.setCandidateId(interview.getCandidate().getId());
            dto.setCandidateName(interview.getCandidate().getFullName());
            dto.setCandidateEmail(interview.getCandidate().getEmail());
            dto.setCandidatePhone(interview.getCandidate().getPhone());
        }

        if (interview.getRecruiter() != null) {
            dto.setRecruiterId(interview.getRecruiter().getId());
            dto.setRecruiterName(interview.getRecruiter().getFullName());
        }

        dto.setInterviewerName(interview.getInterviewerName());
        dto.setInterviewerEmail(interview.getInterviewerEmail());
        dto.setRoundName(interview.getRoundName());
        dto.setInterviewType(interview.getInterviewType());
        dto.setMeetingMode(interview.getMeetingMode());
        dto.setMeetingLink(interview.getMeetingLink());
        dto.setScheduledStartTime(interview.getScheduledStartTime());
        dto.setScheduledEndTime(interview.getScheduledEndTime());
        dto.setTimezone(interview.getTimezone());
        dto.setStatus(interview.getStatus());
        dto.setInstructions(interview.getInstructions());
        dto.setRescheduleReason(interview.getRescheduleReason());
        dto.setCandidateNotes(interview.getCandidateNotes());

        dto.setTechnicalRating(interview.getTechnicalRating());
        dto.setProblemSolvingRating(interview.getProblemSolvingRating());
        dto.setCommunicationRating(interview.getCommunicationRating());
        dto.setCulturalFitRating(interview.getCulturalFitRating());
        dto.setOverallRating(interview.getOverallRating());
        dto.setRecommendation(interview.getRecommendation());
        dto.setInterviewerFeedback(interview.getInterviewerFeedback());
        dto.setFeedbackSubmittedAt(interview.getFeedbackSubmittedAt());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setUpdatedAt(interview.getUpdatedAt());

        return dto;
    }
}
