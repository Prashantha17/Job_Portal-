export interface RecruiterOverview {
  totalJobs: number;
  activeJobs: number;
  totalVacancies: number;
  totalApplications: number;
  avgTimeToHireDays: number;
  offerAcceptanceRate: number;
  shortlistRate: number;
  interviewPassRate: number;
  activeCandidatesInPipeline: number;
  hiredCount: number;
  rejectedCount: number;
}

export interface FunnelStageMetric {
  stage: string;
  displayName: string;
  count: number;
  conversionPercentage: number;
  dropOffRate: number;
}

export interface StageFunnel {
  totalApplications: number;
  stages: FunnelStageMetric[];
  rejectedCount: number;
  withdrawnCount: number;
}

export interface ApplicationTrendPoint {
  period: string;
  applicationCount: number;
  hiredCount: number;
}

export interface SkillVelocity {
  skillName: string;
  demandCount: number;
  supplyCount: number;
  demandSupplyRatio: number;
  demandLevel: 'HIGH' | 'MEDIUM' | 'MODERATE' | string;
}

export interface JobPerformanceMetric {
  jobId: number;
  title: string;
  companyName: string;
  location: string;
  workplaceType: string;
  employmentType: string;
  status: string;
  minSalary?: number;
  maxSalary?: number;
  vacanciesCount: number;
  totalApplicants: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  hiredCount: number;
  avgTimeToHireDays: number;
  conversionRate: number;
}

export interface RecruiterAnalyticsResponse {
  overview: RecruiterOverview;
  funnel: StageFunnel;
  applicationTrends: ApplicationTrendPoint[];
  skillsVelocity: SkillVelocity[];
  jobPerformance: JobPerformanceMetric[];
}

