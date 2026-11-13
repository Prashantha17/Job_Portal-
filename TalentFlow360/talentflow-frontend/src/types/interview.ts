export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'RESCHEDULE_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type InterviewType =
  | 'TECH_ROUND_1'
  | 'TECH_ROUND_2'
  | 'SYSTEM_DESIGN'
  | 'HR_ROUND'
  | 'MANAGERIAL';

export type MeetingMode =
  | 'GOOGLE_MEET'
  | 'ZOOM'
  | 'MICROSOFT_TEAMS'
  | 'IN_PERSON_OFFICE';

export type RecommendationType =
  | 'STRONG_HIRE'
  | 'HIRE'
  | 'HOLD'
  | 'NO_HIRE';

export interface ScheduleInterviewRequest {
  applicationId: number;
  roundName: string;
  interviewType: InterviewType;
  meetingMode: MeetingMode;
  meetingLink?: string;
  scheduledStartTime: string; // ISO string
  scheduledEndTime: string;   // ISO string
  timezone?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  instructions?: string;
}

export interface UpdateInterviewStatusRequest {
  status: InterviewStatus;
  rescheduleReason?: string;
  candidateNotes?: string;
}

export interface SubmitFeedbackRequest {
  technicalRating: number;
  problemSolvingRating: number;
  communicationRating: number;
  culturalFitRating: number;
  recommendation: RecommendationType;
  interviewerFeedback?: string;
}

export interface InterviewResponse {
  id: number;
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyId?: number;
  companyName?: string;
  companyLogoUrl?: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  recruiterId: number;
  recruiterName: string;
  interviewerName?: string;
  interviewerEmail?: string;
  roundName: string;
  interviewType: InterviewType;
  meetingMode: MeetingMode;
  meetingLink?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  timezone: string;
  status: InterviewStatus;
  instructions?: string;
  rescheduleReason?: string;
  candidateNotes?: string;
  technicalRating?: number;
  problemSolvingRating?: number;
  communicationRating?: number;
  culturalFitRating?: number;
  overallRating?: number;
  recommendation?: RecommendationType;
  interviewerFeedback?: string;
  feedbackSubmittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

