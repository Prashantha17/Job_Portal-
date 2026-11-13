package com.talentflow.backend.service;

import com.talentflow.backend.dto.PageResponse;
import com.talentflow.backend.dto.job.CompanyDTO;
import com.talentflow.backend.entity.Company;
import com.talentflow.backend.entity.RecruiterProfile;
import com.talentflow.backend.entity.User;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.mapper.JobMapper;
import com.talentflow.backend.repository.CompanyRepository;
import com.talentflow.backend.repository.RecruiterProfileRepository;
import com.talentflow.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;

    public CompanyService(CompanyRepository companyRepository,
                          RecruiterProfileRepository recruiterProfileRepository,
                          UserRepository userRepository,
                          JobMapper jobMapper) {
        this.companyRepository = companyRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.userRepository = userRepository;
        this.jobMapper = jobMapper;
    }

    @Transactional
    public Company getOrCreateCompany(String name) {
        return companyRepository.findByNameIgnoreCase(name.trim())
                .orElseGet(() -> {
                    Company company = new Company();
                    company.setName(name.trim());
                    company.setVerified(true);
                    return companyRepository.save(company);
                });
    }

    @Transactional(readOnly = true)
    public PageResponse<CompanyDTO> getVerifiedCompanies(Pageable pageable) {
        Page<Company> page = companyRepository.findByIsVerifiedTrue(pageable);
        List<CompanyDTO> dtos = page.getContent().stream()
                .map(jobMapper::toCompanyDTO)
                .collect(Collectors.toList());
        return PageResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return jobMapper.toCompanyDTO(company);
    }

    @Transactional
    public CompanyDTO updateCompany(Long id, CompanyDTO req) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        if (req.getName() != null && !req.getName().isBlank()) {
            company.setName(req.getName().trim());
        }
        if (req.getDescription() != null) company.setDescription(req.getDescription().trim());
        if (req.getWebsite() != null) company.setWebsite(req.getWebsite().trim());
        if (req.getIndustry() != null) company.setIndustry(req.getIndustry().trim());
        if (req.getCompanySize() != null) company.setCompanySize(req.getCompanySize().trim());
        if (req.getHeadquarters() != null) company.setHeadquarters(req.getHeadquarters().trim());
        if (req.getLogoUrl() != null) company.setLogoUrl(req.getLogoUrl().trim());

        Company saved = companyRepository.save(company);
        return jobMapper.toCompanyDTO(saved);
    }

    @Transactional
    public CompanyDTO getMyCompany(String recruiterEmail) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", recruiterEmail));

        RecruiterProfile profile = recruiterProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("RecruiterProfile", "user", recruiterEmail));

        Company company = profile.getCompany();
        if (company == null) {
            company = getOrCreateCompany(profile.getCompanyName() != null ? profile.getCompanyName() : "TalentFlow Enterprise");
            profile.setCompany(company);
            recruiterProfileRepository.save(profile);
        }

        return jobMapper.toCompanyDTO(company);
    }
}

