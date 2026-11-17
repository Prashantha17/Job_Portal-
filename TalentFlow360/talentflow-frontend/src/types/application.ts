export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'TECH_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'SELECTED'
  | 'OFFER_RELEASED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyId?: number;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  workplaceType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  status: ApplicationStatus;
  candidateProfileId?: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  currentCtcLpa?: number;
  expectedCtcLpa?: number;
  coverLetter?: string;
  resumeId?: number;
  resumeTitle?: string;
  resumeUrl?: string;
  rejectionReason?: string;
  remarks?: string;
  notes?: string;
  atsScore?: number;
  atsMatchTier?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface AtsAnalysisReport {
  id?: string;
  applicationId?: number;
  jobId?: number;
  jobTitle?: string;
  candidateEmail?: string;
  resumeFileName?: string;
  atsScore: number;
  matchTier: 'EXCELLENT_MATCH' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE_MATCH' | 'NEEDS_IMPROVEMENT';
  skillsScore: number;
  experienceScore: number;
  keywordScore: number;
  formatScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  topStrengths: string[];
  suggestions: string[];
  mistakes?: string[];
  improvements?: string[];
  wordCount?: number;
  candidateNameExtracted?: string;
  detectedDegree?: string;
  detectedYearsExp?: number;
  contactSummary?: string;
  detectedSections?: string[];
  bulletAudits?: string[];
  summary: string;
  analyzedAt?: string;
}

export interface ApplyJobRequest {
  jobId: number;
  resumeId?: number;
  resumeUrl?: string;
  coverLetter?: string;
  candidateName?: string;
  candidatePhone?: string;
  currentCtcLpa?: number;
  expectedCtcLpa?: number;
}

export interface ApplicationStatusHistoryItem {
  id: number;
  applicationId: number;
  oldStatus?: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedBy: string;
  remarks?: string;
  changedAt: string;
}

