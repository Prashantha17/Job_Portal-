export interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
    verified: boolean;
    location: string;
  };
  location: string;
  workplaceType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel: 'ENTRY' | 'MID_LEVEL' | 'SENIOR' | 'LEAD';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  skills: string[];
  description: string;
  postedDate: string;
  matchScore?: number;
  featured?: boolean;
  applicantsCount?: number;
}

export interface JobFilters {
  query: string;
  location: string;
  workplaceType: string;
  jobType: string;
  experienceLevel: string;
}

