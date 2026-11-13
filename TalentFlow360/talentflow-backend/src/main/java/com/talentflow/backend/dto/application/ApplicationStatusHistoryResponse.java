package com.talentflow.backend.dto.application;

import com.talentflow.backend.entity.ApplicationStatus;
import java.time.Instant;

public class ApplicationStatusHistoryResponse {

    private Long id;
    private Long applicationId;
    private ApplicationStatus oldStatus;
    private ApplicationStatus newStatus;
    private String changedBy;
    private String remarks;
    private Instant changedAt;

    public ApplicationStatusHistoryResponse() {}

    public ApplicationStatusHistoryResponse(Long id, Long applicationId, ApplicationStatus oldStatus,
                                          ApplicationStatus newStatus, String changedBy, String remarks,
                                          Instant changedAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.remarks = remarks;
        this.changedAt = changedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public ApplicationStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ApplicationStatus oldStatus) { this.oldStatus = oldStatus; }

    public ApplicationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ApplicationStatus newStatus) { this.newStatus = newStatus; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
}

