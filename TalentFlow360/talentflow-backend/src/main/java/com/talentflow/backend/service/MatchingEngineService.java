package com.talentflow.backend.service;

import com.talentflow.backend.dto.matching.CandidateMatchDto;
import com.talentflow.backend.dto.matching.JobRecommendationDto;
import com.talentflow.backend.dto.matching.MatchBreakdownDto;
import com.talentflow.backend.entity.*;
import com.talentflow.backend.exception.ResourceNotFoundException;
import com.talentflow.backend.repository.ApplicationRepository;
import com.talentflow.backend.repository.CandidateProfileRepository;
import com.talentflow.backend.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MatchingEngineService {

    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationRepository applicationRepository;

    public MatchingEngineService(JobRepository jobRepository,
                                 CandidateProfileRepository candidateProfileRepository,
                                 ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Recommends published jobs for a candidate ranked by algorithmic match score.
     */
    public List<JobRecommendationDto> getRecommendationsForCandidate(String candidateEmail, int limit) {
        CandidateProfile candidate = candidateProfileRepository.findByUserEmailWithSkills(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for email: " + candidateEmail));

        List<Job> publishedJobs = jobRepository.findByStatusWithSkills(JobStatus.PUBLISHED);
        List<Application> candidateApplications = applicationRepository.findByCandidateProfileUserEmailOrderByAppliedAtDesc(candidateEmail);

        Map<Long, Application> appByJobId = candidateApplications.stream()
                .collect(Collectors.toMap(a -> a.getJob().getId(), a -> a, (first, second) -> first));

        List<JobRecommendationDto> recommendations = new ArrayList<>();

        for (Job job : publishedJobs) {
            MatchBreakdownDto breakdown = calculateMatch(candidate, job);

            JobRecommendationDto dto = new JobRecommendationDto();
            dto.setJobId(job.getId());
            dto.setTitle(job.getTitle());
            dto.setCompanyName(job.getCompany() != null ? job.getCompany().getName() : "Confidential");
            dto.setCompanyLogoUrl(job.getCompany() != null ? job.getCompany().getLogoUrl() : null);
            dto.setLocation(job.getLocation());
            dto.setWorkplaceType(job.getWorkplaceType());
            dto.setEmploymentType(job.getEmploymentType());
            dto.setMinSalary(job.getMinSalary());
            dto.setMaxSalary(job.getMaxSalary());
            dto.setCurrency(job.getCurrency() != null ? job.getCurrency() : "INR");
            dto.setExperienceYearsMin(job.getExperienceYearsMin());
            dto.setVacanciesCount(job.getVacanciesCount());
            dto.setCreatedAt(job.getCreatedAt());

            List<String> skillNames = job.getJobSkills().stream()
                    .map(js -> js.getSkill().getName())
                    .collect(Collectors.toList());
            dto.setSkills(skillNames);

            dto.setMatchScore(breakdown.getTotalScore());
            dto.setMatchTier(breakdown.getMatchTier());
            dto.setBreakdown(breakdown);

            Application app = appByJobId.get(job.getId());
            dto.setHasApplied(app != null);
            if (app != null) {
                dto.setApplicationId(app.getId());
                dto.setApplicationStatus(app.getStatus());
            }

            recommendations.add(dto);
        }

        recommendations.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return recommendations.stream().limit(Math.max(1, limit)).collect(Collectors.toList());
    }

    /**
     * Ranks talent pool candidates against a specific job vacancy for recruiters.
     */
    public List<CandidateMatchDto> getTopMatchedCandidatesForJob(Long jobId, int limit) {
        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found with ID: " + jobId));

        List<CandidateProfile> allCandidates = candidateProfileRepository.findAllWithSkills();
        List<Application> jobApplications = applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);

        Map<Long, Application> appByCandidateId = jobApplications.stream()
                .collect(Collectors.toMap(a -> a.getCandidateProfile().getId(), a -> a, (first, second) -> first));

        List<CandidateMatchDto> matches = new ArrayList<>();

        for (CandidateProfile candidate : allCandidates) {
            MatchBreakdownDto breakdown = calculateMatch(candidate, job);

            CandidateMatchDto dto = new CandidateMatchDto();
            dto.setCandidateId(candidate.getId());
            if (candidate.getUser() != null) {
                dto.setCandidateName(candidate.getUser().getFirstName() + " " + candidate.getUser().getLastName());
                dto.setEmail(candidate.getUser().getEmail());
                dto.setPhone(candidate.getUser().getPhone());
            } else {
                dto.setCandidateName("Anonymous Candidate");
            }
            dto.setHeadline(candidate.getHeadline());
            dto.setLocation(candidate.getLocation());
            dto.setTotalExperienceYears(candidate.getTotalExperienceYears() != null ? candidate.getTotalExperienceYears() : 0.0);
            dto.setCurrentSalary(candidate.getCurrentSalary());
            dto.setExpectedSalary(candidate.getExpectedSalary());

            List<String> candSkills = candidate.getSkills().stream()
                    .map(cs -> cs.getSkill().getName())
                    .collect(Collectors.toList());
            dto.setSkills(candSkills);

            dto.setMatchScore(breakdown.getTotalScore());
            dto.setMatchTier(breakdown.getMatchTier());
            dto.setBreakdown(breakdown);

            Application app = appByCandidateId.get(candidate.getId());
            dto.setHasApplied(app != null);
            if (app != null) {
                dto.setApplicationId(app.getId());
                dto.setApplicationStatus(app.getStatus());
            }

            matches.add(dto);
        }

        matches.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return matches.stream().limit(Math.max(1, limit)).collect(Collectors.toList());
    }

    /**
     * Evaluates all applicants of a specific job and scores them for ATS prioritization.
     * Optimized to O(1) database queries (batch fetch) + O(N) in-memory scoring, eliminating N+1 DB calls.
     */
    public List<CandidateMatchDto> getJobApplicantMatches(Long jobId) {
        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found with ID: " + jobId));

        List<Application> jobApplications = applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);
        List<CandidateMatchDto> matches = new ArrayList<>();
        if (jobApplications.isEmpty()) {
            return matches;
        }

        // Batch-fetch all unique candidate profiles in a single query (O(1) database roundtrip)
        Set<Long> candidateProfileIds = jobApplications.stream()
                .filter(app -> app.getCandidateProfile() != null && app.getCandidateProfile().getId() != null)
                .map(app -> app.getCandidateProfile().getId())
                .collect(Collectors.toSet());

        Map<Long, CandidateProfile> candidateProfileMap = candidateProfileIds.isEmpty() ? Collections.emptyMap() :
                candidateProfileRepository.findAllByIdInWithSkills(candidateProfileIds).stream()
                        .collect(Collectors.toMap(CandidateProfile::getId, cp -> cp, (existing, replacement) -> existing));

        for (Application app : jobApplications) {
            CandidateProfile candidate = (app.getCandidateProfile() != null && app.getCandidateProfile().getId() != null)
                    ? candidateProfileMap.getOrDefault(app.getCandidateProfile().getId(), app.getCandidateProfile())
                    : app.getCandidateProfile();

            if (candidate == null) {
                continue;
            }

            MatchBreakdownDto breakdown = calculateMatch(candidate, job);

            CandidateMatchDto dto = new CandidateMatchDto();
            dto.setCandidateId(candidate.getId());
            dto.setCandidateName(app.getCandidateName());
            dto.setEmail(app.getCandidateEmail());
            dto.setPhone(app.getCandidatePhone());
            dto.setHeadline(candidate.getHeadline());
            dto.setLocation(candidate.getLocation());
            dto.setTotalExperienceYears(candidate.getTotalExperienceYears() != null ? candidate.getTotalExperienceYears() : 0.0);
            dto.setCurrentSalary(app.getCurrentCtcLpa() != null ? app.getCurrentCtcLpa() * 100000.0 : candidate.getCurrentSalary());
            dto.setExpectedSalary(app.getExpectedCtcLpa() != null ? app.getExpectedCtcLpa() * 100000.0 : candidate.getExpectedSalary());

            List<String> candSkills = candidate.getSkills().stream()
                    .map(cs -> cs.getSkill().getName())
                    .collect(Collectors.toList());
            dto.setSkills(candSkills);

            dto.setMatchScore(breakdown.getTotalScore());
            dto.setMatchTier(breakdown.getMatchTier());
            dto.setBreakdown(breakdown);

            dto.setHasApplied(true);
            dto.setApplicationId(app.getId());
            dto.setApplicationStatus(app.getStatus());

            matches.add(dto);
        }

        matches.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return matches;
    }

    /**
     * Core Algorithmic Matching Formula (0 - 100 Scale):
     * Skills (50%) + Experience (20%) + Location (15%) + Salary (15%)
     */
    public MatchBreakdownDto calculateMatch(CandidateProfile candidate, Job job) {
        if (candidate == null || job == null) {
            return new MatchBreakdownDto(0, 0, 0, 0, 0, "LOW_MATCH",
                    Collections.emptyList(), Collections.emptyList(),
                    Collections.emptyList(), Collections.emptyList(),
                    "No data available", "No data available", "No data available");
        }

        // Candidate Skill Map: Normalized Name -> CandidateSkill
        Map<String, CandidateSkill> candidateSkillMap = new HashMap<>();
        if (candidate.getSkills() != null) {
            for (CandidateSkill cs : candidate.getSkills()) {
                if (cs.getSkill() != null && cs.getSkill().getName() != null) {
                    candidateSkillMap.put(normalizeSkill(cs.getSkill().getName()), cs);
                }
            }
        }

        // Job Skills Breakdown
        List<JobSkill> requiredJobSkills = new ArrayList<>();
        List<JobSkill> preferredJobSkills = new ArrayList<>();

        if (job.getJobSkills() != null) {
            for (JobSkill js : job.getJobSkills()) {
                if (js.getRequirementLevel() == SkillRequirementLevel.REQUIRED) {
                    requiredJobSkills.add(js);
                } else {
                    preferredJobSkills.add(js);
                }
            }
        }

        List<String> matchedReq = new ArrayList<>();
        List<String> missingReq = new ArrayList<>();
        List<String> matchedPref = new ArrayList<>();
        List<String> missingPref = new ArrayList<>();

        double skillsScore = 0.0;

        // --- 1. SKILLS SCORING (MAX 50.0) ---
        if (requiredJobSkills.isEmpty() && preferredJobSkills.isEmpty()) {
            // If job has no explicit skills listed, fallback to keywords in title/description
            skillsScore = calculateKeywordSkillScore(candidate, job);
        } else {
            double reqWeight = preferredJobSkills.isEmpty() ? 50.0 : 35.0;
            double prefWeight = preferredJobSkills.isEmpty() ? 0.0 : 15.0;

            // Required Skills
            if (!requiredJobSkills.isEmpty()) {
                double perReqWeight = reqWeight / requiredJobSkills.size();
                for (JobSkill rjs : requiredJobSkills) {
                    String norm = normalizeSkill(rjs.getSkill().getName());
                    if (candidateSkillMap.containsKey(norm)) {
                        matchedReq.add(rjs.getSkill().getName());
                        CandidateSkill cs = candidateSkillMap.get(norm);
                        double factor = (cs.getYearsOfExperience() != null && rjs.getMinYearsExperience() != null
                                && cs.getYearsOfExperience() >= rjs.getMinYearsExperience()) ? 1.0 : 0.85;
                        skillsScore += perReqWeight * factor;
                    } else {
                        missingReq.add(rjs.getSkill().getName());
                    }
                }
            } else {
                skillsScore += reqWeight; // No mandatory skills requested
            }

            // Preferred Skills
            if (!preferredJobSkills.isEmpty()) {
                double perPrefWeight = prefWeight / preferredJobSkills.size();
                for (JobSkill pjs : preferredJobSkills) {
                    String norm = normalizeSkill(pjs.getSkill().getName());
                    if (candidateSkillMap.containsKey(norm)) {
                        matchedPref.add(pjs.getSkill().getName());
                        skillsScore += perPrefWeight;
                    } else {
                        missingPref.add(pjs.getSkill().getName());
                    }
                }
            }
        }
        skillsScore = Math.min(50.0, Math.max(0.0, skillsScore));

        // --- 2. EXPERIENCE SCORING (MAX 20.0) ---
        double experienceScore;
        String experienceSummary;
        int minExp = job.getExperienceYearsMin() != null ? job.getExperienceYearsMin() : 0;
        double candExp = candidate.getTotalExperienceYears() != null ? candidate.getTotalExperienceYears() : 0.0;

        if (minExp == 0) {
            experienceScore = 20.0;
            experienceSummary = String.format("Open for all experience levels (Candidate has %.1f yrs)", candExp);
        } else if (candExp >= minExp) {
            if (candExp > (minExp + 10) && minExp <= 2) {
                // Highly experienced for entry role
                experienceScore = 17.5;
                experienceSummary = String.format("%.1f yrs experience (Significantly exceeds %d yrs minimum)", candExp, minExp);
            } else {
                experienceScore = 20.0;
                experienceSummary = String.format("%.1f yrs meets/exceeds %d yrs requirement", candExp, minExp);
            }
        } else {
            experienceScore = Math.max(2.0, (candExp / minExp) * 20.0);
            experienceSummary = String.format("%.1f yrs is below %d yrs required (%.0f%% experience fit)", candExp, minExp, (candExp / minExp) * 100);
        }
        experienceScore = Math.min(20.0, Math.max(0.0, experienceScore));

        // --- 3. LOCATION & WORKPLACE SCORING (MAX 15.0) ---
        double locationScore;
        String locationSummary;
        WorkplaceType wp = job.getWorkplaceType() != null ? job.getWorkplaceType() : WorkplaceType.REMOTE;

        if (wp == WorkplaceType.REMOTE) {
            locationScore = 15.0;
            locationSummary = "100% Remote Position (Open to talent across India)";
        } else {
            boolean cityMatch = isCityMatch(candidate.getLocation(), job.getLocation());
            if (cityMatch) {
                locationScore = 15.0;
                locationSummary = String.format("Direct location match: %s", job.getLocation());
            } else if (candidate.getLocation() != null &&
                    (candidate.getLocation().toLowerCase().contains("remote") ||
                     candidate.getLocation().toLowerCase().contains("relocate") ||
                     candidate.getLocation().toLowerCase().contains("india"))) {
                locationScore = 12.0;
                locationSummary = "Candidate open to relocation / remote transition";
            } else if (wp == WorkplaceType.HYBRID) {
                locationScore = 8.0;
                locationSummary = String.format("Hybrid in %s (Candidate in %s)", job.getLocation(), candidate.getLocation());
            } else {
                locationScore = 5.0;
                locationSummary = String.format("On-site in %s (Candidate in %s)", job.getLocation(), candidate.getLocation());
            }
        }
        locationScore = Math.min(15.0, Math.max(0.0, locationScore));

        // --- 4. SALARY / CTC COMPATIBILITY (MAX 15.0) ---
        double salaryScore;
        String salarySummary;
        Double candExpected = candidate.getExpectedSalary();
        Double jobMin = job.getMinSalary();
        Double jobMax = job.getMaxSalary();

        if (candExpected == null || candExpected <= 0) {
            salaryScore = 12.5;
            salarySummary = "Expected CTC not specified (Neutral match)";
        } else if (jobMax != null && jobMax > 0) {
            if (candExpected <= jobMax) {
                salaryScore = 15.0;
                salarySummary = String.format("Expected CTC (₹%.1f LPA) is within budget (Max ₹%.1f LPA)",
                        candExpected / 100000.0, jobMax / 100000.0);
            } else if (candExpected <= (jobMax * 1.15)) {
                salaryScore = 10.0;
                salarySummary = String.format("Expected CTC (₹%.1f LPA) slightly exceeds max (₹%.1f LPA) by < 15%%",
                        candExpected / 100000.0, jobMax / 100000.0);
            } else if (candExpected <= (jobMax * 1.30)) {
                salaryScore = 6.0;
                salarySummary = String.format("Expected CTC (₹%.1f LPA) exceeds budget by < 30%%",
                        candExpected / 100000.0, jobMax / 100000.0);
            } else {
                salaryScore = 2.0;
                salarySummary = String.format("Expected CTC (₹%.1f LPA) significantly exceeds budget (₹%.1f LPA)",
                        candExpected / 100000.0, jobMax / 100000.0);
            }
        } else if (jobMin != null && jobMin > 0) {
            salaryScore = candExpected >= (jobMin * 0.8) ? 14.0 : 10.0;
            salarySummary = String.format("Expected CTC (₹%.1f LPA) aligns with base (₹%.1f LPA)",
                    candExpected / 100000.0, jobMin / 100000.0);
        } else {
            salaryScore = 12.5;
            salarySummary = "Salary negotiable / competitive";
        }
        salaryScore = Math.min(15.0, Math.max(0.0, salaryScore));

        // --- TOTAL SCORE & TIER ---
        double rawTotal = skillsScore + experienceScore + locationScore + salaryScore;
        double totalScore = Math.min(100.0, Math.max(0.0, Math.round(rawTotal * 10.0) / 10.0));

        String matchTier;
        if (totalScore >= 90.0) matchTier = "EXCEPTIONAL_MATCH";
        else if (totalScore >= 75.0) matchTier = "STRONG_MATCH";
        else if (totalScore >= 60.0) matchTier = "GOOD_MATCH";
        else if (totalScore >= 40.0) matchTier = "MODERATE_MATCH";
        else matchTier = "LOW_MATCH";

        return new MatchBreakdownDto(
                Math.round(skillsScore * 10.0) / 10.0,
                Math.round(experienceScore * 10.0) / 10.0,
                Math.round(locationScore * 10.0) / 10.0,
                Math.round(salaryScore * 10.0) / 10.0,
                totalScore,
                matchTier,
                matchedReq,
                matchedPref,
                missingReq,
                missingPref,
                experienceSummary,
                locationSummary,
                salarySummary
        );
    }

    private double calculateKeywordSkillScore(CandidateProfile candidate, Job job) {
        String jobText = ((job.getTitle() != null ? job.getTitle() : "") + " " +
                (job.getDescription() != null ? job.getDescription() : "")).toLowerCase();

        if (candidate.getSkills() == null || candidate.getSkills().isEmpty()) {
            return 25.0; // Baseline neutral
        }

        int matches = 0;
        for (CandidateSkill cs : candidate.getSkills()) {
            if (cs.getSkill() != null && cs.getSkill().getName() != null) {
                String s = cs.getSkill().getName().toLowerCase();
                if (jobText.contains(s)) {
                    matches++;
                }
            }
        }

        return Math.min(50.0, Math.max(15.0, matches * 12.0));
    }

    private String normalizeSkill(String skill) {
        if (skill == null) return "";
        String s = skill.trim().toLowerCase();
        s = s.replace(".", "").replace("-", " ").replace("_", " ");
        if (s.equals("react js") || s.equals("reactjs")) return "react";
        if (s.equals("node js") || s.equals("nodejs")) return "node";
        if (s.equals("vue js") || s.equals("vuejs")) return "vue";
        if (s.equals("angular js") || s.equals("angularjs")) return "angular";
        if (s.equals("springboot")) return "spring boot";
        if (s.equals("amazon web services")) return "aws";
        if (s.equals("google cloud") || s.equals("google cloud platform")) return "gcp";
        if (s.equals("k8s")) return "kubernetes";
        if (s.equals("postgres")) return "postgresql";
        if (s.equals("mongo")) return "mongodb";
        if (s.equals("ts")) return "typescript";
        if (s.equals("js")) return "javascript";
        return s;
    }

    private boolean isCityMatch(String candidateLocation, String jobLocation) {
        if (candidateLocation == null || jobLocation == null) return false;
        String c = candidateLocation.toLowerCase();
        String j = jobLocation.toLowerCase();

        String[][] synonyms = {
                {"bengaluru", "bangalore"},
                {"mumbai", "bombay", "navi mumbai", "thane"},
                {"delhi", "new delhi", "noida", "gurgaon", "gurugram", "ncr"},
                {"hyderabad", "secunderabad"},
                {"pune", "pcmc"},
                {"chennai", "madras"},
                {"kolkata", "calcutta"},
                {"ahmedabad", "gandhinagar"},
                {"kochi", "cochin", "trivandrum", "thiruvananthapuram"}
        };

        for (String[] group : synonyms) {
            boolean inCandidate = false;
            boolean inJob = false;
            for (String city : group) {
                if (c.contains(city)) inCandidate = true;
                if (j.contains(city)) inJob = true;
            }
            if (inCandidate && inJob) return true;
        }

        // Direct token substring match
        String[] cTokens = c.split("[,/\\s]+");
        for (String token : cTokens) {
            if (token.length() > 3 && j.contains(token)) {
                return true;
            }
        }

        return false;
    }
}
