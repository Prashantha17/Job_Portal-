import api from './api';

export type WorkplaceType = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type SkillRequirementLevel = 'REQUIRED' | 'PREFERRED';

export interface JobSkillDTO {
  id?: number;
  skillId?: number;
  skillName: string;
  category?: string;
  requirementLevel: SkillRequirementLevel;
  minYearsExperience: number;
}

export interface JobSkillRequest {
  skillId?: number;
  skillName: string;
  requirementLevel: SkillRequirementLevel;
  minYearsExperience: number;
}

export interface JobSummary {
  id: number;
  companyId: number;
  companyName: string;
  companyLogoUrl?: string;
  isCompanyVerified: boolean;
  title: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  experienceYearsMin: number;
  status: JobStatus;
  applicationsCount: number;
  topSkills: string[];
  createdAt: string;
}

export interface JobDetail extends JobSummary {
  description: string;
  requirements?: string;
  responsibilities?: string;
  experienceYearsMax?: number;
  vacanciesCount: number;
  viewsCount: number;
  expiresAt?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  postedByName?: string;
  skills: JobSkillDTO[];
}

export interface CreateJobPayload {
  companyId?: number;
  companyName?: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  experienceYearsMin?: number;
  experienceYearsMax?: number;
  vacanciesCount?: number;
  status?: JobStatus;
  expiresAt?: string;
  skills?: JobSkillRequest[];
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface CompanyDetail {
  id: number;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  logoUrl?: string;
  isVerified: boolean;
  activeJobsCount: number;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  workplaceType?: WorkplaceType | '';
  employmentType?: EmploymentType | '';
  minSalary?: number;
  maxSalary?: number;
  status?: JobStatus;
  skillIds?: number[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const jobService = {
  // Search & Browse Public Jobs
  async searchJobs(params: JobSearchParams = {}): Promise<PageResponse<JobSummary>> {
    const cleanParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 9,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };

    if (params.keyword?.trim()) cleanParams.keyword = params.keyword.trim();
    if (params.location?.trim()) cleanParams.location = params.location.trim();
    if (params.workplaceType) cleanParams.workplaceType = params.workplaceType;
    if (params.employmentType) cleanParams.employmentType = params.employmentType;
    if (params.minSalary !== undefined && params.minSalary > 0) cleanParams.minSalary = params.minSalary;
    if (params.maxSalary !== undefined && params.maxSalary > 0) cleanParams.maxSalary = params.maxSalary;
    if (params.status) cleanParams.status = params.status;
    if (params.skillIds && params.skillIds.length > 0) cleanParams.skillIds = params.skillIds.join(',');

    const response = await api.get<PageResponse<JobSummary>>('/api/v1/jobs', { params: cleanParams });
    return response.data;
  },

  // Get full job details
  async getJobById(id: number): Promise<JobDetail> {
    const response = await api.get<JobDetail>(`/api/v1/jobs/${id}`);
    return response.data;
  },

  // Recruiter: Get my published jobs
  async getMyJobs(): Promise<JobSummary[]> {
    const response = await api.get<JobSummary[]>('/api/v1/jobs/my');
    return response.data;
  },

  // Recruiter: Create new job vacancy
  async createJob(payload: CreateJobPayload): Promise<JobDetail> {
    const response = await api.post<JobDetail>('/api/v1/jobs', payload);
    return response.data;
  },

  // Recruiter: Update job vacancy
  async updateJob(id: number, payload: UpdateJobPayload): Promise<JobDetail> {
    const response = await api.put<JobDetail>(`/api/v1/jobs/${id}`, payload);
    return response.data;
  },

  // Recruiter: Change vacancy status
  async updateJobStatus(id: number, status: JobStatus): Promise<JobDetail> {
    const response = await api.patch<JobDetail>(`/api/v1/jobs/${id}/status`, { status });
    return response.data;
  },

  // Recruiter: Delete job vacancy
  async deleteJob(id: number): Promise<void> {
    await api.delete(`/api/v1/jobs/${id}`);
  },

  // Companies
  async getVerifiedCompanies(page = 0, size = 12): Promise<PageResponse<CompanyDetail>> {
    const response = await api.get<PageResponse<CompanyDetail>>('/api/v1/companies', {
      params: { page, size }
    });
    return response.data;
  },

  async getCompanyById(id: number): Promise<CompanyDetail> {
    const response = await api.get<CompanyDetail>(`/api/v1/companies/${id}`);
    return response.data;
  },

  async getMyCompany(): Promise<CompanyDetail> {
    const response = await api.get<CompanyDetail>('/api/v1/companies/me');
    return response.data;
  },

  async updateCompany(id: number, payload: Partial<CompanyDetail>): Promise<CompanyDetail> {
    const response = await api.put<CompanyDetail>(`/api/v1/companies/${id}`, payload);
    return response.data;
  }
};

export default jobService;

