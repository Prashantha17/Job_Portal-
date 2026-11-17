package com.talentflow.backend.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "resumes")
public class ResumeDocument {

    @Id
    private String id;

    @Indexed
    private Long candidateProfileId;

    @Indexed
    private String candidateEmail;

    private String title;
    private String fileName;
    private String contentType;
    private long fileSize;

    // Binary file bytes stored directly in MongoDB
    private byte[] fileData;

    // Extracted textual content (from PDF, DOCX, TXT) used for AI ATS scanning
    private String parsedText;

    private boolean isPrimary = true;
    private Instant uploadedAt = Instant.now();

    public ResumeDocument() {}

    public ResumeDocument(Long candidateProfileId, String candidateEmail, String title,
                          String fileName, String contentType, long fileSize,
                          byte[] fileData, String parsedText, boolean isPrimary) {
        this.candidateProfileId = candidateProfileId;
        this.candidateEmail = candidateEmail;
        this.title = title;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.fileData = fileData;
        this.parsedText = parsedText;
        this.isPrimary = isPrimary;
        this.uploadedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getCandidateProfileId() { return candidateProfileId; }
    public void setCandidateProfileId(Long candidateProfileId) { this.candidateProfileId = candidateProfileId; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public String getParsedText() { return parsedText; }
    public void setParsedText(String parsedText) { this.parsedText = parsedText; }

    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
