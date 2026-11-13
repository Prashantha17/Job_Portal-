package com.talentflow.backend.dto.interview;

import com.talentflow.backend.entity.InterviewStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateInterviewStatusRequest {

    @NotNull(message = "Interview status is required")
    private InterviewStatus status;

    private String rescheduleReason;

    private String candidateNotes;

    public UpdateInterviewStatusRequest() {}

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public String getRescheduleReason() { return rescheduleReason; }
    public void setRescheduleReason(String rescheduleReason) { this.rescheduleReason = rescheduleReason; }

    public String getCandidateNotes() { return candidateNotes; }
    public void setCandidateNotes(String candidateNotes) { this.candidateNotes = candidateNotes; }
}

