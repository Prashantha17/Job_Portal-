package com.talentflow.backend.service;

import com.talentflow.backend.dto.PageResponse;
import com.talentflow.backend.dto.job.*;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.mapper.JobMapper;
import com.talentflow.backend.repository.*;
import com.talentflow.backend.repository.specification.JobSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final SkillService skillService;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyService companyService;
    private final JobMapper jobMapper;

    public JobService(JobRepository jobRepository,
                      CompanyRepository companyRepository,
                      UserRepository userRepository,
                      RecruiterProfileRepository recruiterProfileRepository,
                      SkillService skillService,
                      JobSkillRepository jobSkillRepository,
                      CompanyService companyService,
                      JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.skillService = skillService;
        this.jobSkillRepository = jobSkillRepository;
        this.companyService = companyService;
        this.jobMapper = jobMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<JobSummaryResponse> searchJobs(String keyword,
                                                       String location,
                                                       WorkplaceType workplaceType,
                                                       EmploymentType employmentType,
                                                       Double minSalary,
                                                       Double maxSalary,
                                                       JobStatus status,
                                                       List<Long> skillIds,
                                                       int page,
                                                       int size,
                                                       String sortBy,
                                                       String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        JobStatus targetStatus = status != null ? status : JobStatus.PUBLISHED;
        Specification<Job> spec = JobSpecifications.filterJobs(
                keyword, location, workplaceType, employmentType, minSalary, maxSalary, targetStatus, skillIds
        );

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);
        List<JobSummaryResponse> summaryList = jobPage.getContent().stream()
                .map(jobMapper::toJobSummaryResponse)
                .collect(Collectors.toList());

        return PageResponse.from(jobPage, summaryList);
    }

    @Transactional
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        // Increment view count
        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);

        return jobMapper.toJobResponse(job);
    }

    @Transactional
    public JobResponse createJob(String recruiterEmail, CreateJobRequest req) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        Company company;
        if (req.getCompanyId() != null) {
            company = companyRepository.findById(req.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", req.getCompanyId()));
        } else if (req.getCompanyName() != null && !req.getCompanyName().isBlank()) {
            company = companyService.getOrCreateCompany(req.getCompanyName());
        } else {
            // Default to recruiter's linked company
            RecruiterProfile recProfile = recruiterProfileRepository.findByUser(user).orElse(null);
            if (recProfile != null && recProfile.getCompany() != null) {
                company = recProfile.getCompany();
            } else if (recProfile != null && recProfile.getCompanyName() != null) {
                company = companyService.getOrCreateCompany(recProfile.getCompanyName());
                recProfile.setCompany(company);
                recruiterProfileRepository.save(recProfile);
            } else {
                company = companyService.getOrCreateCompany("TalentFlow Enterprise");
            }
        }

        Job job = new Job(
                company,
                user,
                req.getTitle().trim(),
                req.getDescription(),
                req.getRequirements(),
                req.getResponsibilities(),
                req.getLocation().trim(),
                req.getWorkplaceType(),
                req.getEmploymentType(),
                req.getMinSalary(),
                req.getMaxSalary(),
                req.getExperienceYearsMin(),
                req.getVacanciesCount(),
                req.getStatus() != null ? req.getStatus() : JobStatus.PUBLISHED
        );

        if (req.getCurrency() != null) job.setCurrency(req.getCurrency());
        if (req.getExperienceYearsMax() != null) job.setExperienceYearsMax(req.getExperienceYearsMax());
        if (req.getExpiresAt() != null) job.setExpiresAt(req.getExpiresAt());

        Job savedJob = jobRepository.save(job);

        // Add skills
        if (req.getSkills() != null && !req.getSkills().isEmpty()) {
            List<JobSkill> jobSkills = new ArrayList<>();
            for (JobSkillRequest skillReq : req.getSkills()) {
                Skill skill = skillService.getOrCreateSkill(skillReq.getSkillName());
                JobSkill jobSkill = new JobSkill(
                        savedJob,
                        skill,
                        skillReq.getRequirementLevel(),
                        skillReq.getMinYearsExperience()
                );
                jobSkills.add(jobSkillRepository.save(jobSkill));
            }
            savedJob.setJobSkills(jobSkills);
        }

        return jobMapper.toJobResponse(savedJob);
    }

    @Transactional
    public JobResponse updateJob(String recruiterEmail, Long jobId, UpdateJobRequest req) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        verifyJobOwnership(recruiterEmail, job);

        if (req.getTitle() != null && !req.getTitle().isBlank()) job.setTitle(req.getTitle().trim());
        if (req.getDescription() != null) job.setDescription(req.getDescription());
        if (req.getRequirements() != null) job.setRequirements(req.getRequirements());
        if (req.getResponsibilities() != null) job.setResponsibilities(req.getResponsibilities());
        if (req.getLocation() != null && !req.getLocation().isBlank()) job.setLocation(req.getLocation().trim());
        if (req.getWorkplaceType() != null) job.setWorkplaceType(req.getWorkplaceType());
        if (req.getEmploymentType() != null) job.setEmploymentType(req.getEmploymentType());
        if (req.getMinSalary() != null) job.setMinSalary(req.getMinSalary());
        if (req.getMaxSalary() != null) job.setMaxSalary(req.getMaxSalary());
        if (req.getCurrency() != null) job.setCurrency(req.getCurrency());
        if (req.getExperienceYearsMin() != null) job.setExperienceYearsMin(req.getExperienceYearsMin());
        if (req.getExperienceYearsMax() != null) job.setExperienceYearsMax(req.getExperienceYearsMax());
        if (req.getVacanciesCount() != null) job.setVacanciesCount(req.getVacanciesCount());
        if (req.getStatus() != null) job.setStatus(req.getStatus());
        if (req.getExpiresAt() != null) job.setExpiresAt(req.getExpiresAt());

        if (req.getSkills() != null) {
            jobSkillRepository.deleteByJob(job);
            List<JobSkill> updatedSkills = new ArrayList<>();
            for (JobSkillRequest skillReq : req.getSkills()) {
                Skill skill = skillService.getOrCreateSkill(skillReq.getSkillName());
                JobSkill jobSkill = new JobSkill(
                        job,
                        skill,
                        skillReq.getRequirementLevel(),
                        skillReq.getMinYearsExperience()
                );
                updatedSkills.add(jobSkillRepository.save(jobSkill));
            }
            job.setJobSkills(updatedSkills);
        }

        Job saved = jobRepository.save(job);
        return jobMapper.toJobResponse(saved);
    }

    @Transactional
    public JobResponse updateJobStatus(String recruiterEmail, Long jobId, JobStatus newStatus) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        verifyJobOwnership(recruiterEmail, job);
        job.setStatus(newStatus);
        Job saved = jobRepository.save(job);
        return jobMapper.toJobResponse(saved);
    }

    @Transactional
    public void deleteJob(String recruiterEmail, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        verifyJobOwnership(recruiterEmail, job);
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public List<JobSummaryResponse> getMyJobs(String recruiterEmail) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        List<Job> jobs = jobRepository.findByPostedByOrderByCreatedAtDesc(user);
        return jobMapper.toJobSummaryResponseList(jobs);
    }

    private void verifyJobOwnership(String email, Job job) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        boolean isOwner = job.getPostedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_SUPER_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to modify this job vacancy.");
        }
    }
}

