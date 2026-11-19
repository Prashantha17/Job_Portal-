import apiClient from './api';
import { ApiResponse } from '../types/health';
import { ApplicationResponse, ApplyJobRequest, ApplicationStatusHistoryItem, AtsAnalysisReport, SendOfferLetterRequest } from '../types/application';

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

  async analyzeAts(jobId?: number, file?: File, resumeId?: number, targetRole?: string): Promise<AtsAnalysisReport> {
    const formData = new FormData();
    if (jobId) formData.append('jobId', String(jobId));
    if (targetRole) formData.append('targetRole', targetRole);
    if (file) formData.append('file', file);
    if (resumeId) formData.append('resumeId', String(resumeId));

    const response = await apiClient.post<ApiResponse<AtsAnalysisReport>>('/api/v1/applications/analyze-ats', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async auditResumeStandalone(file?: File, resumeId?: number, targetRole?: string): Promise<AtsAnalysisReport> {
    return this.analyzeAts(undefined, file, resumeId, targetRole);
  },

  async getApplicationAtsAnalysis(applicationId: number): Promise<AtsAnalysisReport> {
    const response = await apiClient.get<ApiResponse<AtsAnalysisReport>>(`/api/v1/applications/${applicationId}/ats-analysis`);
    return response.data.data;
  },

  async sendOfferLetter(applicationId: number, req: SendOfferLetterRequest): Promise<ApplicationResponse> {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>(
      `/api/v1/applications/${applicationId}/offer-letter/send`,
      req
    );
    return response.data.data;
  },

  async previewOfferLetterPdf(applicationId: number, req: SendOfferLetterRequest): Promise<Blob> {
    const response = await apiClient.post(`/api/v1/applications/${applicationId}/offer-letter/preview-pdf`, req, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadOfferLetter(applicationId: number, fileName?: string): Promise<void> {
    const response = await apiClient.get(`/api/v1/applications/${applicationId}/offer-letter/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `Offer_Letter_App_${applicationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async withdrawApplication(applicationId: number): Promise<void> {
    await apiClient.delete(`/api/v1/applications/${applicationId}/withdraw`);
  },
};

