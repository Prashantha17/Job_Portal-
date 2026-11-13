package com.talentflow.backend.dto.interview;

import com.talentflow.backend.entity.InterviewType;
import com.talentflow.backend.entity.MeetingMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ScheduleInterviewRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Round name is required (e.g. Technical Round 1)")
    private String roundName;

    @NotNull(message = "Interview type is required")
    private InterviewType interviewType = InterviewType.TECH_ROUND_1;

    @NotNull(message = "Meeting mode is required")
    private MeetingMode meetingMode = MeetingMode.GOOGLE_MEET;

    private String meetingLink;

    @NotNull(message = "Scheduled start time is required")
    private Instant scheduledStartTime;

    @NotNull(message = "Scheduled end time is required")
    private Instant scheduledEndTime;

    private String timezone = "Asia/Kolkata (IST)";

    private String interviewerName;

    private String interviewerEmail;

    private String instructions;

    public ScheduleInterviewRequest() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

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

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public String getInterviewerEmail() { return interviewerEmail; }
    public void setInterviewerEmail(String interviewerEmail) { this.interviewerEmail = interviewerEmail; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}

