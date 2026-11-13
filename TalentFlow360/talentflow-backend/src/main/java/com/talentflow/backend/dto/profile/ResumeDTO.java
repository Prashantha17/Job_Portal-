package com.talentflow.backend.dto.profile;

import java.time.Instant;

public class ResumeDTO {
    private Long id;
    private String title;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String contentType;
    private boolean isPrimary;
    private Instant uploadedAt;

    public ResumeDTO() {}

    public ResumeDTO(Long id, String title, String fileName, String filePath,
                     Long fileSize, String contentType, boolean isPrimary, Instant uploadedAt) {
        this.id = id;
        this.title = title;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.isPrimary = isPrimary;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}

