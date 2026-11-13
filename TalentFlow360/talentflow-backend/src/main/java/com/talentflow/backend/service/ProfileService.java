package com.talentflow.backend.service;

import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.mapper.ProfileMapper;
import com.talentflow.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ResumeRepository resumeRepository;
    private final SkillService skillService;
    private final ProfileMapper profileMapper;

    public ProfileService(UserRepository userRepository,
                          CandidateProfileRepository candidateProfileRepository,
                          RecruiterProfileRepository recruiterProfileRepository,
                          EducationRepository educationRepository,
                          ExperienceRepository experienceRepository,
                          CandidateSkillRepository candidateSkillRepository,
                          ResumeRepository resumeRepository,
                          SkillService skillService,
                          ProfileMapper profileMapper) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.resumeRepository = resumeRepository;
        this.skillService = skillService;
        this.profileMapper = profileMapper;
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

