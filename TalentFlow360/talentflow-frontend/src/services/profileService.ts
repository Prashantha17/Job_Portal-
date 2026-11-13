import api from './api';

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface Experience {
  id?: number;
  companyName: string;
  jobTitle: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CandidateSkill {
  id?: number;
  skillId?: number;
  skillName: string;
  category?: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience: number;
}

export interface ResumeItem {
  id: number;
  title: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  contentType?: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface CandidateProfile {
  id?: number;
  userId?: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  educations: Education[];
  experiences: Experience[];
  skills: CandidateSkill[];
  resumes: ResumeItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCandidateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface RecruiterProfile {
  id?: number;
  userId?: number;
  email: string;
  fullName: string;
  companyName: string;
  designation: string;
  department?: string;
  corporateEmail?: string;
  corporatePhone?: string;
  linkedinUrl?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateRecruiterProfilePayload {
  companyName: string;
  designation: string;
  department?: string;
  corporateEmail?: string;
  corporatePhone?: string;
  linkedinUrl?: string;
}

export interface SkillItem {
  id: number;
  name: string;
  category: string;
}

export const profileService = {
  // Candidate Profile APIs
  getCandidateProfile: async (): Promise<CandidateProfile> => {
    const response = await api.get<CandidateProfile>('/api/v1/candidates/me');
    return response.data;
  },

  updateCandidateProfile: async (data: UpdateCandidateProfilePayload): Promise<CandidateProfile> => {
    const response = await api.put<CandidateProfile>('/api/v1/candidates/me', data);
    return response.data;
  },

  addEducation: async (edu: Omit<Education, 'id'>): Promise<Education> => {
    const response = await api.post<Education>('/api/v1/candidates/me/education', edu);
    return response.data;
  },

  deleteEducation: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/candidates/me/education/${id}`);
  },

  addExperience: async (exp: Omit<Experience, 'id'>): Promise<Experience> => {
    const response = await api.post<Experience>('/api/v1/candidates/me/experience', exp);
    return response.data;
  },

  deleteExperience: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/candidates/me/experience/${id}`);
  },

  addSkill: async (skill: {
    skillName: string;
    category?: string;
    proficiencyLevel: string;
    yearsOfExperience: number;
  }): Promise<CandidateSkill> => {
    const response = await api.post<CandidateSkill>('/api/v1/candidates/me/skills', skill);
    return response.data;
  },

  deleteSkill: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/candidates/me/skills/${id}`);
  },

  uploadResume: async (data: {
    title: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    contentType?: string;
    isPrimary?: boolean;
  }): Promise<ResumeItem> => {
    const response = await api.post<ResumeItem>('/api/v1/candidates/me/resume', data);
    return response.data;
  },

  getResumes: async (): Promise<ResumeItem[]> => {
    const response = await api.get<ResumeItem[]>('/api/v1/candidates/me/resume');
    return response.data;
  },

  deleteResume: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/candidates/me/resume/${id}`);
  },

  setPrimaryResume: async (id: number): Promise<ResumeItem> => {
    const response = await api.patch<ResumeItem>(`/api/v1/candidates/me/resume/${id}/primary`);
    return response.data;
  },

  // Recruiter Profile APIs
  getRecruiterProfile: async (): Promise<RecruiterProfile> => {
    const response = await api.get<RecruiterProfile>('/api/v1/recruiters/me');
    return response.data;
  },

  updateRecruiterProfile: async (data: UpdateRecruiterProfilePayload): Promise<RecruiterProfile> => {
    const response = await api.put<RecruiterProfile>('/api/v1/recruiters/me', data);
    return response.data;
  },

  // Skills Catalog
  getSkills: async (query?: string, category?: string): Promise<SkillItem[]> => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    const response = await api.get<SkillItem[]>(`/api/v1/skills?${params.toString()}`);
    return response.data;
  },
};

export default profileService;

