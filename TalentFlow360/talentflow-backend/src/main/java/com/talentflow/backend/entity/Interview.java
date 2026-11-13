package com.talentflow.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(name = "interviewer_name", length = 150)
    private String interviewerName;

    @Column(name = "interviewer_email", length = 150)
    private String interviewerEmail;

    @Column(name = "round_name", nullable = false, length = 120)
    private String roundName;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 30)
    private InterviewType interviewType = InterviewType.TECH_ROUND_1;

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_mode", nullable = false, length = 30)
    private MeetingMode meetingMode = MeetingMode.GOOGLE_MEET;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "scheduled_start_time", nullable = false)
    private Instant scheduledStartTime;

    @Column(name = "scheduled_end_time", nullable = false)
    private Instant scheduledEndTime;

    @Column(length = 60)
    private String timezone = "Asia/Kolkata (IST)";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "reschedule_reason", columnDefinition = "TEXT")
    private String rescheduleReason;

    @Column(name = "candidate_notes", columnDefinition = "TEXT")
    private String candidateNotes;

    // Scorecard & Feedback fields
    @Column(name = "technical_rating")
    private Integer technicalRating;

    @Column(name = "problem_solving_rating")
    private Integer problemSolvingRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "cultural_fit_rating")
    private Integer culturalFitRating;

    @Column(name = "overall_rating")
    private Double overallRating;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private RecommendationType recommendation;

    @Column(name = "interviewer_feedback", columnDefinition = "TEXT")
    private String interviewerFeedback;

    @Column(name = "feedback_submitted_at")
    private Instant feedbackSubmittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Interview() {}

    public Interview(Application application, Job job, User candidate, User recruiter,
                     String roundName, InterviewType interviewType, MeetingMode meetingMode,
                     String meetingLink, Instant scheduledStartTime, Instant scheduledEndTime,
                     String interviewerName, String interviewerEmail, String instructions) {
        this.application = application;
        this.job = job;
        this.candidate = candidate;
        this.recruiter = recruiter;
        this.roundName = roundName;
        this.interviewType = interviewType;
        this.meetingMode = meetingMode;
        this.meetingLink = meetingLink;
        this.scheduledStartTime = scheduledStartTime;
        this.scheduledEndTime = scheduledEndTime;
        this.interviewerName = interviewerName;
        this.interviewerEmail = interviewerEmail;
        this.instructions = instructions;
        this.status = InterviewStatus.SCHEDULED;
        this.timezone = "Asia/Kolkata (IST)";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public User getCandidate() { return candidate; }
    public void setCandidate(User candidate) { this.candidate = candidate; }

    public User getRecruiter() { return recruiter; }
    public void setRecruiter(User recruiter) { this.recruiter = recruiter; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public String getInterviewerEmail() { return interviewerEmail; }
    public void setInterviewerEmail(String interviewerEmail) { this.interviewerEmail = interviewerEmail; }

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }

    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }

    public MeetingMode getMeetingMode() { return meetingMode; }
    public void setMeetingMode(MeetingMode meetingMode) { this.meetingMode = meetingMode; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public Instant getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(Instant scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public Instant getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(Instant scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getRescheduleReason() { return rescheduleReason; }
    public void setRescheduleReason(String rescheduleReason) { this.rescheduleReason = rescheduleReason; }

    public String getCandidateNotes() { return candidateNotes; }
    public void setCandidateNotes(String candidateNotes) { this.candidateNotes = candidateNotes; }

    public Integer getTechnicalRating() { return technicalRating; }
    public void setTechnicalRating(Integer technicalRating) { this.technicalRating = technicalRating; }

    public Integer getProblemSolvingRating() { return problemSolvingRating; }
    public void setProblemSolvingRating(Integer problemSolvingRating) { this.problemSolvingRating = problemSolvingRating; }

    public Integer getCommunicationRating() { return communicationRating; }
    public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }

    public Integer getCulturalFitRating() { return culturalFitRating; }
    public void setCulturalFitRating(Integer culturalFitRating) { this.culturalFitRating = culturalFitRating; }

    public Double getOverallRating() { return overallRating; }
    public void setOverallRating(Double overallRating) { this.overallRating = overallRating; }

    public RecommendationType getRecommendation() { return recommendation; }
    public void setRecommendation(RecommendationType recommendation) { this.recommendation = recommendation; }

    public String getInterviewerFeedback() { return interviewerFeedback; }
    public void setInterviewerFeedback(String interviewerFeedback) { this.interviewerFeedback = interviewerFeedback; }

    public Instant getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(Instant feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

