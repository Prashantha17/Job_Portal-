package com.talentflow.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "job_applications", indexes = {
        @Index(name = "idx_app_job_candidate", columnList = "job_id, candidate_profile_id", unique = true),
        @Index(name = "idx_app_status", columnList = "status")
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    private CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "candidate_name", length = 150)
    private String candidateName;

    @Column(name = "candidate_email", length = 120)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 30)
    private String candidatePhone;

    @Column(name = "current_ctc_lpa")
    private Double currentCtcLpa;

    @Column(name = "expected_ctc_lpa")
    private Double expectedCtcLpa;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "ats_score")
    private Double atsScore;

    @Column(name = "ats_match_tier", length = 50)
    private String atsMatchTier;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Application() {}

    public Application(Job job, CandidateProfile candidateProfile, Resume resume, String coverLetter) {
        this.job = job;
        this.candidateProfile = candidateProfile;
        this.resume = resume;
        this.coverLetter = coverLetter;
        this.status = ApplicationStatus.APPLIED;
        this.appliedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        this.appliedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public CandidateProfile getCandidateProfile() { return candidateProfile; }
    public void setCandidateProfile(CandidateProfile candidateProfile) { this.candidateProfile = candidateProfile; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidatePhone() { return candidatePhone; }
    public void setCandidatePhone(String candidatePhone) { this.candidatePhone = candidatePhone; }

    public Double getCurrentCtcLpa() { return currentCtcLpa; }
    public void setCurrentCtcLpa(Double currentCtcLpa) { this.currentCtcLpa = currentCtcLpa; }

    public Double getExpectedCtcLpa() { return expectedCtcLpa; }
    public void setExpectedCtcLpa(Double expectedCtcLpa) { this.expectedCtcLpa = expectedCtcLpa; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Double getAtsScore() { return atsScore; }
    public void setAtsScore(Double atsScore) { this.atsScore = atsScore; }

    public String getAtsMatchTier() { return atsMatchTier; }
    public void setAtsMatchTier(String atsMatchTier) { this.atsMatchTier = atsMatchTier; }

    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

