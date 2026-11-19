package com.talentflow.backend.dto.chat;

import java.time.Instant;

public class ChatMessageDTO {

    private Long id;
    private Long applicationId;
    private String jobTitle;
    private String companyName;
    private String senderEmail;
    private String senderName;
    private String senderRole;
    private String recipientEmail;
    private String content;
    private boolean isRead;
    private Instant createdAt;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Long id, Long applicationId, String jobTitle, String companyName,
                          String senderEmail, String senderName, String senderRole,
                          String recipientEmail, String content, boolean isRead, Instant createdAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.recipientEmail = recipientEmail;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
