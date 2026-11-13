package com.talentflow.backend.dto.profile;

import java.time.Instant;
import java.util.List;

public class CandidateProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String headline;
    private String bio;
    private String location;
    private Double totalExperienceYears;
    private Double currentSalary;
    private Double expectedSalary;
    private String websiteUrl;
    private String githubUrl;
    private String linkedinUrl;
    private List<EducationDTO> educations;
    private List<ExperienceDTO> experiences;
    private List<CandidateSkillDTO> skills;
    private List<ResumeDTO> resumes;
    private Instant createdAt;
    private Instant updatedAt;

    public CandidateProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getTotalExperienceYears() { return totalExperienceYears; }
    public void setTotalExperienceYears(Double totalExperienceYears) { this.totalExperienceYears = totalExperienceYears; }

    public Double getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(Double currentSalary) { this.currentSalary = currentSalary; }

    public Double getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Double expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public List<EducationDTO> getEducations() { return educations; }
    public void setEducations(List<EducationDTO> educations) { this.educations = educations; }

    public List<ExperienceDTO> getExperiences() { return experiences; }
    public void setExperiences(List<ExperienceDTO> experiences) { this.experiences = experiences; }

    public List<CandidateSkillDTO> getSkills() { return skills; }
    public void setSkills(List<CandidateSkillDTO> skills) { this.skills = skills; }

    public List<ResumeDTO> getResumes() { return resumes; }
    public void setResumes(List<ResumeDTO> resumes) { this.resumes = resumes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static CandidateProfileResponseBuilder builder() {
        return new CandidateProfileResponseBuilder();
    }

    public static class CandidateProfileResponseBuilder {
        private CandidateProfileResponse response = new CandidateProfileResponse();

        public CandidateProfileResponseBuilder id(Long id) { response.setId(id); return this; }
        public CandidateProfileResponseBuilder userId(Long userId) { response.setUserId(userId); return this; }
        public CandidateProfileResponseBuilder email(String email) { response.setEmail(email); return this; }
        public CandidateProfileResponseBuilder firstName(String firstName) { response.setFirstName(firstName); return this; }
        public CandidateProfileResponseBuilder lastName(String lastName) { response.setLastName(lastName); return this; }
        public CandidateProfileResponseBuilder fullName(String fullName) { response.setFullName(fullName); return this; }
        public CandidateProfileResponseBuilder phone(String phone) { response.setPhone(phone); return this; }
        public CandidateProfileResponseBuilder headline(String headline) { response.setHeadline(headline); return this; }
        public CandidateProfileResponseBuilder bio(String bio) { response.setBio(bio); return this; }
        public CandidateProfileResponseBuilder location(String location) { response.setLocation(location); return this; }
        public CandidateProfileResponseBuilder totalExperienceYears(Double totalExperienceYears) { response.setTotalExperienceYears(totalExperienceYears); return this; }
        public CandidateProfileResponseBuilder currentSalary(Double currentSalary) { response.setCurrentSalary(currentSalary); return this; }
        public CandidateProfileResponseBuilder expectedSalary(Double expectedSalary) { response.setExpectedSalary(expectedSalary); return this; }
        public CandidateProfileResponseBuilder websiteUrl(String websiteUrl) { response.setWebsiteUrl(websiteUrl); return this; }
        public CandidateProfileResponseBuilder githubUrl(String githubUrl) { response.setGithubUrl(githubUrl); return this; }
        public CandidateProfileResponseBuilder linkedinUrl(String linkedinUrl) { response.setLinkedinUrl(linkedinUrl); return this; }
        public CandidateProfileResponseBuilder educations(List<EducationDTO> educations) { response.setEducations(educations); return this; }
        public CandidateProfileResponseBuilder experiences(List<ExperienceDTO> experiences) { response.setExperiences(experiences); return this; }
        public CandidateProfileResponseBuilder skills(List<CandidateSkillDTO> skills) { response.setSkills(skills); return this; }
        public CandidateProfileResponseBuilder resumes(List<ResumeDTO> resumes) { response.setResumes(resumes); return this; }
        public CandidateProfileResponseBuilder createdAt(Instant createdAt) { response.setCreatedAt(createdAt); return this; }
        public CandidateProfileResponseBuilder updatedAt(Instant updatedAt) { response.setUpdatedAt(updatedAt); return this; }

        public CandidateProfileResponse build() {
            return response;
        }
    }
}

