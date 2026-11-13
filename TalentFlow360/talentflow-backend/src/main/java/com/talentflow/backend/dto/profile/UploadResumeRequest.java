package com.talentflow.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;

public class UploadResumeRequest {

    @NotBlank(message = "Resume title is required")
    private String title;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File path/URL is required")
    private String filePath;

    private Long fileSize;
    private String contentType = "application/pdf";
    private boolean isPrimary = true;

    public UploadResumeRequest() {}

    public UploadResumeRequest(String title, String fileName, String filePath, Long fileSize, String contentType, boolean isPrimary) {
        this.title = title;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.contentType = contentType != null ? contentType : "application/pdf";
        this.isPrimary = isPrimary;
    }

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
}

