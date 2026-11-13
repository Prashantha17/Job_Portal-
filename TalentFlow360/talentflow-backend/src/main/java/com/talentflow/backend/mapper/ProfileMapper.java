package com.talentflow.backend.mapper;

import com.talentflow.backend.dto.profile.*;
import com.talentflow.backend.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProfileMapper {

    public EducationDTO toEducationDTO(Education entity) {
        if (entity == null) return null;
        return new EducationDTO(
                entity.getId(),
                entity.getInstitution(),
                entity.getDegree(),
                entity.getFieldOfStudy(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getGrade(),
                entity.getDescription()
        );
    }

    public List<EducationDTO> toEducationDTOList(List<Education> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toEducationDTO).collect(Collectors.toList());
    }

    public ExperienceDTO toExperienceDTO(Experience entity) {
        if (entity == null) return null;
        return new ExperienceDTO(
                entity.getId(),
                entity.getCompanyName(),
                entity.getJobTitle(),
                entity.getLocation(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.isCurrent(),
                entity.getDescription()
        );
    }

    public List<ExperienceDTO> toExperienceDTOList(List<Experience> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toExperienceDTO).collect(Collectors.toList());
    }

    public CandidateSkillDTO toCandidateSkillDTO(CandidateSkill entity) {
        if (entity == null) return null;
        return new CandidateSkillDTO(
                entity.getId(),
                entity.getSkill() != null ? entity.getSkill().getId() : null,
                entity.getSkill() != null ? entity.getSkill().getName() : null,
                entity.getSkill() != null ? entity.getSkill().getCategory() : null,
                entity.getProficiencyLevel(),
                entity.getYearsOfExperience()
        );
    }

    public List<CandidateSkillDTO> toCandidateSkillDTOList(List<CandidateSkill> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toCandidateSkillDTO).collect(Collectors.toList());
    }

    public ResumeDTO toResumeDTO(Resume entity) {
        if (entity == null) return null;
        return new ResumeDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getFileName(),
                entity.getFilePath(),
                entity.getFileSize(),
                entity.getContentType(),
                entity.isPrimary(),
                entity.getUploadedAt()
        );
    }

    public List<ResumeDTO> toResumeDTOList(List<Resume> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toResumeDTO).collect(Collectors.toList());
    }

    public CandidateProfileResponse toCandidateProfileResponse(CandidateProfile profile) {
        if (profile == null) return null;
        User user = profile.getUser();

        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(user != null ? user.getId() : null)
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .fullName(user != null ? user.getFirstName() + " " + user.getLastName() : null)
                .phone(user != null ? user.getPhone() : null)
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .totalExperienceYears(profile.getTotalExperienceYears())
                .currentSalary(profile.getCurrentSalary())
                .expectedSalary(profile.getExpectedSalary())
                .websiteUrl(profile.getWebsiteUrl())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .educations(toEducationDTOList(profile.getEducations()))
                .experiences(toExperienceDTOList(profile.getExperiences()))
                .skills(toCandidateSkillDTOList(profile.getSkills()))
                .resumes(toResumeDTOList(profile.getResumes()))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public RecruiterProfileDTO toRecruiterProfileDTO(RecruiterProfile profile) {
        if (profile == null) return null;
        User user = profile.getUser();

        return RecruiterProfileDTO.builder()
                .id(profile.getId())
                .userId(user != null ? user.getId() : null)
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFirstName() + " " + user.getLastName() : null)
                .companyName(profile.getCompanyName())
                .designation(profile.getDesignation())
                .department(profile.getDepartment())
                .corporateEmail(profile.getCorporateEmail())
                .corporatePhone(profile.getCorporatePhone())
                .linkedinUrl(profile.getLinkedinUrl())
                .isVerified(profile.isVerified())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public SkillDTO toSkillDTO(Skill entity) {
        if (entity == null) return null;
        return new SkillDTO(entity.getId(), entity.getName(), entity.getCategory());
    }

    public List<SkillDTO> toSkillDTOList(List<Skill> entities) {
        if (entities == null) return Collections.emptyList();
        return entities.stream().map(this::toSkillDTO).collect(Collectors.toList());
    }
}

