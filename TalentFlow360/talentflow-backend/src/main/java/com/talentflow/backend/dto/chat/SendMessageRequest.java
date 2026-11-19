package com.talentflow.backend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 2000, message = "Message content must not exceed 2000 characters")
    private String content;

    public SendMessageRequest() {}

    public SendMessageRequest(Long applicationId, String content) {
        this.applicationId = applicationId;
        this.content = content;
    }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
