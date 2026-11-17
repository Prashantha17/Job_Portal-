import { ApplicationStatus } from './application';
import { EmploymentType, WorkplaceType } from '../services/jobService';

export interface MatchBreakdown {
  skillsScore: number;       // out of 50.0
  experienceScore: number;   // out of 20.0
  locationScore: number;     // out of 15.0
  salaryScore: number;       // out of 15.0
  totalScore: number;        // 0.0 to 100.0
  matchTier: 'EXCEPTIONAL_MATCH' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE_MATCH' | 'LOW_MATCH';
  matchedRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  experienceSummary: string;
  locationSummary: string;
  salarySummary: string;
}

export interface JobRecommendation {
  jobId: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  experienceYearsMin?: number;
  vacanciesCount: number;
  createdAt: string;
  skills: string[];
  matchScore: number;
  matchTier: 'EXCEPTIONAL_MATCH' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE_MATCH' | 'LOW_MATCH';
  breakdown: MatchBreakdown;
  hasApplied: boolean;
  applicationId?: number;
  applicationStatus?: ApplicationStatus;
}

export interface CandidateMatch {
  candidateId: number;
  candidateName: string;
  email: string;
  phone?: string;
  headline?: string;
  location?: string;
  totalExperienceYears: number;
  currentSalary?: number;
  expectedSalary?: number;
  skills: string[];
  matchScore: number;
  matchTier: 'EXCEPTIONAL_MATCH' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE_MATCH' | 'LOW_MATCH';
  breakdown: MatchBreakdown;
  hasApplied: boolean;
  applicationId?: number;
  applicationStatus?: ApplicationStatus;
}
