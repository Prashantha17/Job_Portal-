export type TemplateId =
  | 'modern'       // Modern Silicon Valley (clean two-column teal)
  | 'executive'    // Executive Navy (formal header, corporate)
  | 'minimalist'   // Minimalist Monochrome (pure black & white typography)
  | 'creative'     // Creative Indigo (chips, portfolio highlight)
  | 'two-column'   // Two-Column Specialist (colored left sidebar)
  | 'harvard'      // Harvard Classic (traditional serif, rules)
  | 'startup'      // Startup One-Pager (compact, high-density)
  | 'nordic'       // Nordic Slate (rounded badges, modern header card)
  | 'timeline'     // Timeline Milestone (chronological rail)
  | 'indian-tech'; // Indian Tech Enterprise (tech stack grid, Indian tech hiring)

export type AccentColor =
  | '#0284c7' // Ocean Blue (Default)
  | '#0d9488' // Teal
  | '#4f46e5' // Indigo
  | '#16a34a' // Emerald Green
  | '#9333ea' // Purple
  | '#e11d48' // Rose
  | '#ea580c' // Warm Amber
  | '#0f172a'; // Slate / Dark Nordic

export interface ResumePersonalInfo {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear?: string;
  endYear: string;
  grade?: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  role?: string;
  technologies: string[];
  description: string;
  link?: string;
}

export interface ResumeData {
  templateId: TemplateId;
  accentColor: AccentColor;
  personalInfo: ResumePersonalInfo;
  summary: string;
  experiences: ResumeExperience[];
  educations: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications?: string[];
  totalExperienceYears?: string;
  currentNoticePeriod?: string;
}

