import apiClient from './api';
import { ApiResponse } from '../types/health';
import {
  InterviewResponse,
  ScheduleInterviewRequest,
  UpdateInterviewStatusRequest,
  SubmitFeedbackRequest,
} from '../types/interview';

export const interviewService = {
  async scheduleInterview(payload: ScheduleInterviewRequest): Promise<InterviewResponse> {
    const response = await apiClient.post<ApiResponse<InterviewResponse>>('/api/v1/interviews/schedule', payload);
    return response.data.data;
  },

  async getInterviewById(id: number): Promise<InterviewResponse> {
    const response = await apiClient.get<ApiResponse<InterviewResponse>>(`/api/v1/interviews/${id}`);
    return response.data.data;
  },

  async getInterviewsByApplication(applicationId: number): Promise<InterviewResponse[]> {
    const response = await apiClient.get<ApiResponse<InterviewResponse[]>>(`/api/v1/interviews/application/${applicationId}`);
    return response.data.data;
  },

  async getMyCandidateInterviews(): Promise<InterviewResponse[]> {
    const response = await apiClient.get<ApiResponse<InterviewResponse[]>>('/api/v1/interviews/candidate/my');
    return response.data.data;
  },

  async getMyRecruiterInterviews(): Promise<InterviewResponse[]> {
    const response = await apiClient.get<ApiResponse<InterviewResponse[]>>('/api/v1/interviews/recruiter/my');
    return response.data.data;
  },

  async updateStatus(id: number, payload: UpdateInterviewStatusRequest): Promise<InterviewResponse> {
    const response = await apiClient.patch<ApiResponse<InterviewResponse>>(`/api/v1/interviews/${id}/status`, payload);
    return response.data.data;
  },

  async submitFeedback(id: number, payload: SubmitFeedbackRequest): Promise<InterviewResponse> {
    const response = await apiClient.post<ApiResponse<InterviewResponse>>(`/api/v1/interviews/${id}/feedback`, payload);
    return response.data.data;
  },
};

