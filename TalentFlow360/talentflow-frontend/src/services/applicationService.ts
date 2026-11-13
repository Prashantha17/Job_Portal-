import apiClient from './api';
import { ApiResponse } from '../types/health';
import { ApplicationResponse, ApplyJobRequest, ApplicationStatusHistoryItem } from '../types/application';

export const applicationService = {
  async applyForJob(payload: ApplyJobRequest): Promise<ApplicationResponse> {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>('/api/v1/applications', payload);
    return response.data.data;
  },

  async getMyApplications(): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>('/api/v1/applications/my-applications');
    return response.data.data;
  },

  async getJobApplications(jobId: number): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(`/api/v1/applications/jobs/${jobId}`);
    return response.data.data;
  },

  async updateStatus(
    id: number,
    status: string,
    remarks?: string,
    rejectionReason?: string
  ): Promise<ApplicationResponse> {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(`/api/v1/applications/${id}/status`, {
      status,
      remarks,
      rejectionReason,
    });
    return response.data.data;
  },

  async getApplicationHistory(applicationId: number): Promise<ApplicationStatusHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<ApplicationStatusHistoryItem[]>>(`/api/v1/applications/${applicationId}/history`);
    return response.data.data;
  },
};

