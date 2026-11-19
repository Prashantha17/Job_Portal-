export interface ChatMessage {
  id: number;
  applicationId: number;
  jobTitle: string;
  companyName: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'RECRUITER' | 'CANDIDATE';
  recipientEmail: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessagePayload {
  applicationId: number;
  content: string;
}

export interface ConstructiveFeedback {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  applicationStatus: string;
  atsScore: number;
  matchTier: string;
  constructiveSummary: string;
  identifiedStrengths: string[];
  criticalSkillGaps: string[];
  recommendedActionPlan: string[];
  resumeOptimizationTips: string[];
  encouragementNote: string;
}
