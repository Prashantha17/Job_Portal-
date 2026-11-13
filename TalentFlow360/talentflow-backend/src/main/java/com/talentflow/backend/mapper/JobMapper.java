package com.talentflow.backend.mapper;

import com.talentflow.backend.dto.job.*;
import com.talentflow.backend.entity.Company;
import com.talentflow.backend.entity.Job;
import com.talentflow.backend.entity.JobSkill;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JobMapper {

    public CompanyDTO toCompanyDTO(Company company) {
        if (company == null) return null;
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setDescription(company.getDescription());
        dto.setWebsite(company.getWebsite());
        dto.setIndustry(company.getIndustry());
        dto.setCompanySize(company.getCompanySize());
        dto.setHeadquarters(company.getHeadquarters());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setVerified(company.isVerified());
        dto.setActiveJobsCount(company.getJobs() != null ? company.getJobs().size() : 0);
        return dto;
    }

    public JobSkillDTO toJobSkillDTO(JobSkill jobSkill) {
        if (jobSkill == null) return null;
        return new JobSkillDTO(
                jobSkill.getId(),
                jobSkill.getSkill() != null ? jobSkill.getSkill().getId() : null,
                jobSkill.getSkill() != null ? jobSkill.getSkill().getName() : null,
                jobSkill.getSkill() != null ? jobSkill.getSkill().getCategory() : null,
                jobSkill.getRequirementLevel(),
                jobSkill.getMinYearsExperience()
        );
    }

    public List<JobSkillDTO> toJobSkillDTOList(List<JobSkill> jobSkills) {
        if (jobSkills == null) return Collections.emptyList();
        return jobSkills.stream().map(this::toJobSkillDTO).collect(Collectors.toList());
    }

    public JobResponse toJobResponse(Job job) {
        if (job == null) return null;
        JobResponse res = new JobResponse();
        res.setId(job.getId());

        if (job.getCompany() != null) {
            res.setCompanyId(job.getCompany().getId());
            res.setCompanyName(job.getCompany().getName());
            res.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            res.setCompanyIndustry(job.getCompany().getIndustry());
            res.setCompanyWebsite(job.getCompany().getWebsite());
            res.setCompanyVerified(job.getCompany().isVerified());
        }

        if (job.getPostedBy() != null) {
            res.setPostedById(job.getPostedBy().getId());
            res.setPostedByName(job.getPostedBy().getFirstName() + " " + job.getPostedBy().getLastName());
            res.setPostedByEmail(job.getPostedBy().getEmail());
        }

        res.setTitle(job.getTitle());
        res.setDescription(job.getDescription());
        res.setRequirements(job.getRequirements());
        res.setResponsibilities(job.getResponsibilities());
        res.setLocation(job.getLocation());
        res.setWorkplaceType(job.getWorkplaceType());
        res.setEmploymentType(job.getEmploymentType());
        res.setMinSalary(job.getMinSalary());
        res.setMaxSalary(job.getMaxSalary());
        res.setCurrency(job.getCurrency());
        res.setExperienceYearsMin(job.getExperienceYearsMin());
        res.setExperienceYearsMax(job.getExperienceYearsMax());
        res.setVacanciesCount(job.getVacanciesCount());
        res.setStatus(job.getStatus());
        res.setExpiresAt(job.getExpiresAt());
        res.setViewsCount(job.getViewsCount());
        res.setApplicationsCount(job.getApplicationsCount());
        res.setSkills(toJobSkillDTOList(job.getJobSkills()));
        res.setCreatedAt(job.getCreatedAt());
        res.setUpdatedAt(job.getUpdatedAt());

        return res;
    }

    public JobSummaryResponse toJobSummaryResponse(Job job) {
        if (job == null) return null;
        JobSummaryResponse res = new JobSummaryResponse();
        res.setId(job.getId());

        if (job.getCompany() != null) {
            res.setCompanyId(job.getCompany().getId());
            res.setCompanyName(job.getCompany().getName());
            res.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            res.setCompanyVerified(job.getCompany().isVerified());
        }

        res.setTitle(job.getTitle());
        res.setLocation(job.getLocation());
        res.setWorkplaceType(job.getWorkplaceType());
        res.setEmploymentType(job.getEmploymentType());
        res.setMinSalary(job.getMinSalary());
        res.setMaxSalary(job.getMaxSalary());
        res.setCurrency(job.getCurrency());
        res.setExperienceYearsMin(job.getExperienceYearsMin());
        res.setStatus(job.getStatus());
        res.setApplicationsCount(job.getApplicationsCount());
        res.setCreatedAt(job.getCreatedAt());

        if (job.getJobSkills() != null) {
            res.setTopSkills(job.getJobSkills().stream()
                    .map(js -> js.getSkill().getName())
                    .limit(5)
                    .collect(Collectors.toList()));
        }

        return res;
    }

    public List<JobSummaryResponse> toJobSummaryResponseList(List<Job> jobs) {
        if (jobs == null) return Collections.emptyList();
        return jobs.stream().map(this::toJobSummaryResponse).collect(Collectors.toList());
    }
}

