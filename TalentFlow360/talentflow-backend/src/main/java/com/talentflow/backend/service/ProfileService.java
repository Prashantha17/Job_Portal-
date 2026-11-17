package com.talentflow.backend.service;

import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.mapper.ProfileMapper;
import com.talentflow.backend.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ResumeRepository resumeRepository;
    private final SkillService skillService;
    private final ProfileMapper profileMapper;
    private final com.talentflow.backend.mongorepository.ResumeDocumentRepository resumeDocumentRepository;
    private final AtsResumeAnalyzerService atsResumeAnalyzerService;

    public ProfileService(UserRepository userRepository,
                          CandidateProfileRepository candidateProfileRepository,
                          RecruiterProfileRepository recruiterProfileRepository,
                          EducationRepository educationRepository,
                          ExperienceRepository experienceRepository,
                          CandidateSkillRepository candidateSkillRepository,
                          ResumeRepository resumeRepository,
                          SkillService skillService,
                          ProfileMapper profileMapper,
                          com.talentflow.backend.mongorepository.ResumeDocumentRepository resumeDocumentRepository,
                          AtsResumeAnalyzerService atsResumeAnalyzerService) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.resumeRepository = resumeRepository;
        this.skillService = skillService;
        this.profileMapper = profileMapper;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.atsResumeAnalyzerService = atsResumeAnalyzerService;
    }

    // ==========================================
    // CANDIDATE PROFILE
    // ==========================================

    @Transactional
    public CandidateProfile getOrCreateCandidateProfileEntity(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return candidateProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(user);
                    return candidateProfileRepository.save(newProfile);
                });
    }

    @Transactional
    public CandidateProfileResponse getCandidateProfile(String email) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        return profileMapper.toCandidateProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponse getCandidateProfileById(Long candidateId) {
        CandidateProfile profile = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for id: " + candidateId));
        return profileMapper.toCandidateProfileResponse(profile);
    }

    @Transactional
    public CandidateProfileResponse updateCandidateProfile(String email, UpdateCandidateProfileRequest req) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        User user = profile.getUser();

        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            user.setFirstName(req.getFirstName().trim());
        }
        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            user.setLastName(req.getLastName().trim());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().trim());
        }
        userRepository.save(user);

        if (req.getHeadline() != null) profile.setHeadline(req.getHeadline().trim());
        if (req.getBio() != null) profile.setBio(req.getBio().trim());
        if (req.getLocation() != null) profile.setLocation(req.getLocation().trim());
        if (req.getTotalExperienceYears() != null) profile.setTotalExperienceYears(req.getTotalExperienceYears());
        if (req.getCurrentSalary() != null) profile.setCurrentSalary(req.getCurrentSalary());
        if (req.getExpectedSalary() != null) profile.setExpectedSalary(req.getExpectedSalary());
        if (req.getWebsiteUrl() != null) profile.setWebsiteUrl(req.getWebsiteUrl().trim());
        if (req.getGithubUrl() != null) profile.setGithubUrl(req.getGithubUrl().trim());
        if (req.getLinkedinUrl() != null) profile.setLinkedinUrl(req.getLinkedinUrl().trim());

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return profileMapper.toCandidateProfileResponse(saved);
    }

    // ==========================================
    // EDUCATION
    // ==========================================

    @Transactional
    public EducationDTO addEducation(String email, EducationDTO req) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Education education = new Education(
                profile,
                req.getInstitution().trim(),
                req.getDegree().trim(),
                req.getFieldOfStudy(),
                req.getStartDate(),
                req.getEndDate(),
                req.getGrade(),
                req.getDescription()
        );
        Education saved = educationRepository.save(education);
        return profileMapper.toEducationDTO(saved);
    }

    @Transactional
    public void deleteEducation(String email, Long educationId) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", educationId));

        if (!education.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ResourceNotFoundException("Education record does not belong to candidate");
        }
        educationRepository.delete(education);
    }

    // ==========================================
    // EXPERIENCE
    // ==========================================

    @Transactional
    public ExperienceDTO addExperience(String email, ExperienceDTO req) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Experience experience = new Experience(
                profile,
                req.getCompanyName().trim(),
                req.getJobTitle().trim(),
                req.getLocation(),
                req.getStartDate(),
                req.getEndDate(),
                req.isCurrent(),
                req.getDescription()
        );
        Experience saved = experienceRepository.save(experience);
        return profileMapper.toExperienceDTO(saved);
    }

    @Transactional
    public void deleteExperience(String email, Long experienceId) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", "id", experienceId));

        if (!experience.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ResourceNotFoundException("Experience record does not belong to candidate");
        }
        experienceRepository.delete(experience);
    }

    // ==========================================
    // SKILLS
    // ==========================================

    @Transactional
    public CandidateSkillDTO addCandidateSkill(String email, AddSkillRequest req) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Skill skill = skillService.findOrCreateSkill(req.getSkillName(), req.getCategory());

        CandidateSkill candidateSkill = candidateSkillRepository.findByCandidateProfileAndSkill(profile, skill)
                .map(existing -> {
                    existing.setProficiencyLevel(req.getProficiencyLevel());
                    existing.setYearsOfExperience(req.getYearsOfExperience());
                    return existing;
                })
                .orElseGet(() -> new CandidateSkill(profile, skill, req.getProficiencyLevel(), req.getYearsOfExperience()));

        CandidateSkill saved = candidateSkillRepository.save(candidateSkill);
        return profileMapper.toCandidateSkillDTO(saved);
    }

    @Transactional
    public void removeCandidateSkill(String email, Long candidateSkillId) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        CandidateSkill skill = candidateSkillRepository.findById(candidateSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateSkill", "id", candidateSkillId));

        if (!skill.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ResourceNotFoundException("Skill does not belong to candidate");
        }
        candidateSkillRepository.delete(skill);
    }

    // ==========================================
    // RESUMES
    // ==========================================

    @Transactional
    public ResumeDTO uploadResume(String email, UploadResumeRequest req) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);

        if (req.isPrimary()) {
            List<Resume> existing = resumeRepository.findByCandidateProfile(profile);
            for (Resume r : existing) {
                if (r.isPrimary()) {
                    r.setPrimary(false);
                    resumeRepository.save(r);
                }
            }
        }

        Resume resume = new Resume(
                profile,
                req.getTitle().trim(),
                req.getFileName().trim(),
                req.getFilePath().trim(),
                req.getFileSize(),
                req.getContentType(),
                req.isPrimary()
        );
        Resume saved = resumeRepository.save(resume);
        return profileMapper.toResumeDTO(saved);
    }

    @Transactional
    public ResumeDTO uploadResumeFile(String email, org.springframework.web.multipart.MultipartFile file, String title, boolean isPrimary) throws java.io.IOException {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);

        byte[] bytes = file.getBytes();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "Resume.pdf";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";
        String effectiveTitle = (title != null && !title.isBlank()) ? title.trim() : originalFilename;

        // 1. Extract text for AI ATS Scanning
        String parsedText = atsResumeAnalyzerService.extractText(bytes, contentType, originalFilename);

        // 2. Reset existing primary resumes in MongoDB & MySQL if this is primary
        if (isPrimary) {
            List<Resume> existingSql = resumeRepository.findByCandidateProfile(profile);
            for (Resume r : existingSql) {
                if (r.isPrimary()) {
                    r.setPrimary(false);
                    resumeRepository.save(r);
                }
            }
            List<com.talentflow.backend.document.ResumeDocument> existingMongo = resumeDocumentRepository.findByCandidateProfileId(profile.getId());
            for (com.talentflow.backend.document.ResumeDocument doc : existingMongo) {
                if (doc.isPrimary()) {
                    doc.setPrimary(false);
                    resumeDocumentRepository.save(doc);
                }
            }
        }

        // 3. Save to MongoDB (document storage for binary + parsed text)
        com.talentflow.backend.document.ResumeDocument mongoDoc = new com.talentflow.backend.document.ResumeDocument(
                profile.getId(),
                email,
                effectiveTitle,
                originalFilename,
                contentType,
                file.getSize(),
                bytes,
                parsedText,
                isPrimary
        );
        com.talentflow.backend.document.ResumeDocument savedMongoDoc = resumeDocumentRepository.save(mongoDoc);

        // 4. Save metadata to MySQL with download URL pointing to MongoDB
        String downloadUrl = "/api/v1/candidates/resumes/" + savedMongoDoc.getId() + "/download";
        Resume sqlResume = new Resume(
                profile,
                effectiveTitle,
                originalFilename,
                downloadUrl,
                file.getSize(),
                contentType,
                isPrimary
        );
        Resume savedSql = resumeRepository.save(sqlResume);

        return profileMapper.toResumeDTO(savedSql);
    }

    public java.util.Optional<com.talentflow.backend.document.ResumeDocument> getResumeDocument(String mongoId) {
        java.util.Optional<com.talentflow.backend.document.ResumeDocument> found = resumeDocumentRepository.findById(mongoId);
        if (found.isPresent() && found.get().getFileData() != null && found.get().getFileData().length > 0) {
            return found;
        }

        // Fallback: If mongoId matches a numeric SQL ID
        if (mongoId != null && mongoId.matches("\\d+")) {
            return getResumeDocumentBySqlId(Long.parseLong(mongoId));
        }

        // Fallback: Search SQL resume table for any resume referencing this mongoId
        if (mongoId != null) {
            List<Resume> matches = resumeRepository.findAll().stream()
                    .filter(r -> r.getFilePath() != null && r.getFilePath().contains(mongoId))
                    .toList();
            if (!matches.isEmpty()) {
                return getResumeDocumentBySqlId(matches.get(0).getId());
            }
        }

        return found;
    }

    public java.util.Optional<com.talentflow.backend.document.ResumeDocument> getResumeDocumentBySqlId(Long resumeId) {
        return resumeRepository.findById(resumeId).flatMap(sqlRes -> {
            String path = sqlRes.getFilePath();
            if (path != null && path.contains("/resumes/")) {
                String[] parts = path.split("/resumes/");
                if (parts.length > 1) {
                    String docId = parts[1].replace("/download", "").trim();
                    java.util.Optional<com.talentflow.backend.document.ResumeDocument> found = resumeDocumentRepository.findById(docId);
                    if (found.isPresent() && found.get().getFileData() != null && found.get().getFileData().length > 0) {
                        return found;
                    }
                }
            }
            // Fallback: check by candidate profile primary resume
            if (sqlRes.getCandidateProfile() != null) {
                java.util.Optional<com.talentflow.backend.document.ResumeDocument> primary =
                        resumeDocumentRepository.findByCandidateProfileIdAndIsPrimaryTrue(sqlRes.getCandidateProfile().getId());
                if (primary.isPresent() && primary.get().getFileData() != null && primary.get().getFileData().length > 0) {
                    return primary;
                }

                List<com.talentflow.backend.document.ResumeDocument> list =
                        resumeDocumentRepository.findByCandidateProfileId(sqlRes.getCandidateProfile().getId());
                for (com.talentflow.backend.document.ResumeDocument d : list) {
                    if (d.getFileData() != null && d.getFileData().length > 0) {
                        return java.util.Optional.of(d);
                    }
                }

                // If candidate profile exists but no binary file exists in MongoDB, generate real PDF on-the-fly!
                try {
                    CandidateProfile cand = sqlRes.getCandidateProfile();
                    byte[] generatedPdf = generateCandidateResumePdf(cand, sqlRes.getTitle());
                    String parsedText = atsResumeAnalyzerService.extractText(generatedPdf, "application/pdf", sqlRes.getFileName());
                    com.talentflow.backend.document.ResumeDocument newDoc = new com.talentflow.backend.document.ResumeDocument(
                            cand.getId(),
                            cand.getUser() != null ? cand.getUser().getEmail() : "candidate@talentflow360.com",
                            sqlRes.getTitle(),
                            sqlRes.getFileName() != null ? sqlRes.getFileName() : "Resume.pdf",
                            "application/pdf",
                            (long) generatedPdf.length,
                            generatedPdf,
                            parsedText,
                            sqlRes.isPrimary()
                    );
                    com.talentflow.backend.document.ResumeDocument saved = resumeDocumentRepository.save(newDoc);
                    sqlRes.setFilePath("/api/v1/candidates/resumes/" + saved.getId() + "/download");
                    resumeRepository.save(sqlRes);
                    return java.util.Optional.of(saved);
                } catch (Exception ex) {
                    log.error("Failed to generate and store fallback resume PDF: {}", ex.getMessage(), ex);
                }
            }
            return java.util.Optional.empty();
        });
    }

    public byte[] generateCandidateResumePdf(CandidateProfile profile, String resumeTitle) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                // Header Bar (slate-900)
                cs.setNonStrokingColor(15, 23, 42);
                cs.addRect(0, 720, 612, 72);
                cs.fill();

                // Candidate Name
                cs.beginText();
                cs.setNonStrokingColor(255, 255, 255);
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                cs.newLineAtOffset(50, 755);
                User user = profile.getUser();
                String fullName = (user != null)
                        ? ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                           (user.getLastName() != null ? user.getLastName() : "")).trim()
                        : "Candidate Profile";
                if (fullName.isBlank()) fullName = "Candidate Profile";
                cs.showText(sanitizeText(fullName));

                // Headline
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.newLineAtOffset(0, -18);
                String headline = profile.getHeadline() != null ? profile.getHeadline() : "Software Professional";
                cs.showText(sanitizeText(headline));
                cs.endText();

                // Body Section
                float y = 690;
                cs.setNonStrokingColor(30, 41, 59);

                // Contact Details
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                cs.newLineAtOffset(50, y);
                String email = (profile.getUser() != null && profile.getUser().getEmail() != null)
                        ? profile.getUser().getEmail() : "candidate@talentflow360.com";
                String phone = (profile.getUser() != null && profile.getUser().getPhone() != null)
                        ? profile.getUser().getPhone() : "+91 9876543210";
                String location = profile.getLocation() != null ? profile.getLocation() : "India";
                cs.showText(sanitizeText("Email: " + email + "  |  Phone: " + phone + "  |  Location: " + location));
                cs.endText();
                y -= 25;

                // Professional Summary
                if (profile.getBio() != null && !profile.getBio().isBlank()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                    cs.newLineAtOffset(50, y);
                    cs.showText("PROFESSIONAL SUMMARY");
                    cs.endText();
                    y -= 15;

                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                    cs.newLineAtOffset(50, y);
                    String bio = profile.getBio().replace("\n", " ");
                    if (bio.length() > 95) bio = bio.substring(0, 95) + "...";
                    cs.showText(sanitizeText(bio));
                    cs.endText();
                    y -= 25;
                }

                // Skills
                if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                    cs.newLineAtOffset(50, y);
                    cs.showText("TECHNICAL & PROFESSIONAL SKILLS");
                    cs.endText();
                    y -= 15;

                    StringBuilder sb = new StringBuilder();
                    for (CandidateSkill s : profile.getSkills()) {
                        if (s.getSkill() != null) {
                            if (sb.length() > 0) sb.append(", ");
                            sb.append(s.getSkill().getName());
                        }
                    }
                    String skillsStr = sb.toString();
                    if (skillsStr.length() > 100) skillsStr = skillsStr.substring(0, 100) + "...";

                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                    cs.newLineAtOffset(50, y);
                    cs.showText(sanitizeText(skillsStr));
                    cs.endText();
                    y -= 25;
                }

                // Experience
                if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                    cs.newLineAtOffset(50, y);
                    cs.showText("WORK EXPERIENCE");
                    cs.endText();
                    y -= 16;

                    for (Experience exp : profile.getExperiences()) {
                        if (y < 120) break;
                        cs.beginText();
                        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                        cs.newLineAtOffset(50, y);
                        String expTitle = exp.getJobTitle() + " - " + exp.getCompanyName();
                        cs.showText(sanitizeText(expTitle));
                        cs.endText();
                        y -= 14;

                        if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                            cs.beginText();
                            cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                            cs.newLineAtOffset(60, y);
                            String desc = exp.getDescription().replace("\n", " ");
                            if (desc.length() > 90) desc = desc.substring(0, 90) + "...";
                            cs.showText(sanitizeText(desc));
                            cs.endText();
                            y -= 16;
                        }
                    }
                    y -= 10;
                }

                // Education
                if (profile.getEducations() != null && !profile.getEducations().isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                    cs.newLineAtOffset(50, y);
                    cs.showText("EDUCATION & ACADEMICS");
                    cs.endText();
                    y -= 16;

                    for (Education edu : profile.getEducations()) {
                        if (y < 80) break;
                        cs.beginText();
                        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9);
                        cs.newLineAtOffset(50, y);
                        String eduStr = edu.getDegree() + " (" + edu.getInstitution() + ")";
                        cs.showText(sanitizeText(eduStr));
                        cs.endText();
                        y -= 14;
                    }
                }

                // Footer Notice
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 8);
                cs.setNonStrokingColor(148, 163, 184);
                cs.newLineAtOffset(50, 30);
                cs.showText("TalentFlow 360 AI Career Platform - Verified Candidate Resume Profile");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate fallback resume PDF: {}", e.getMessage(), e);
            return ("TalentFlow 360 Candidate Resume: " + (profile.getUser() != null ? profile.getUser().getEmail() : "Candidate")).getBytes(StandardCharsets.UTF_8);
        }
    }

    private String sanitizeText(String input) {
        if (input == null) return "";
        return input.replaceAll("[^\\x20-\\x7E]", " ").trim();
    }

    @Transactional
    public List<ResumeDTO> getResumes(String email) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        return profileMapper.toResumeDTOList(resumeRepository.findByCandidateProfile(profile));
    }

    @Transactional
    public void deleteResume(String email, Long resumeId) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getCandidateProfile().getId().equals(profile.getId())) {
            throw new ResourceNotFoundException("Resume does not belong to candidate");
        }
        resumeRepository.delete(resume);
    }

    @Transactional
    public ResumeDTO setPrimaryResume(String email, Long resumeId) {
        CandidateProfile profile = getOrCreateCandidateProfileEntity(email);
        List<Resume> list = resumeRepository.findByCandidateProfile(profile);

        Resume target = null;
        for (Resume r : list) {
            if (r.getId().equals(resumeId)) {
                r.setPrimary(true);
                target = r;
            } else {
                r.setPrimary(false);
            }
            resumeRepository.save(r);
        }

        if (target == null) {
            throw new ResourceNotFoundException("Resume", "id", resumeId);
        }
        return profileMapper.toResumeDTO(target);
    }

    // ==========================================
    // RECRUITER PROFILE
    // ==========================================

    @Transactional
    public RecruiterProfile getOrCreateRecruiterProfileEntity(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return recruiterProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    RecruiterProfile newProfile = new RecruiterProfile(
                            user,
                            "TalentFlow Partner Company",
                            "Technical Recruiter",
                            "Human Resources",
                            user.getEmail(),
                            user.getPhone(),
                            "",
                            true
                    );
                    return recruiterProfileRepository.save(newProfile);
                });
    }

    @Transactional
    public RecruiterProfileDTO getRecruiterProfile(String email) {
        RecruiterProfile profile = getOrCreateRecruiterProfileEntity(email);
        return profileMapper.toRecruiterProfileDTO(profile);
    }

    @Transactional
    public RecruiterProfileDTO updateRecruiterProfile(String email, UpdateRecruiterProfileRequest req) {
        RecruiterProfile profile = getOrCreateRecruiterProfileEntity(email);

        if (req.getCompanyName() != null) profile.setCompanyName(req.getCompanyName().trim());
        if (req.getDesignation() != null) profile.setDesignation(req.getDesignation().trim());
        if (req.getDepartment() != null) profile.setDepartment(req.getDepartment().trim());
        if (req.getCorporateEmail() != null) profile.setCorporateEmail(req.getCorporateEmail().trim());
        if (req.getCorporatePhone() != null) profile.setCorporatePhone(req.getCorporatePhone().trim());
        if (req.getLinkedinUrl() != null) profile.setLinkedinUrl(req.getLinkedinUrl().trim());

        RecruiterProfile saved = recruiterProfileRepository.save(profile);
        return profileMapper.toRecruiterProfileDTO(saved);
    }
}

