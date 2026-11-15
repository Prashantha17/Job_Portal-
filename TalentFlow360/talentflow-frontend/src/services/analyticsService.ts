import apiClient from './api';
import { ApiResponse } from '../types/health';
import {
  RecruiterAnalyticsResponse,
  RecruiterOverview,
  StageFunnel,
  ApplicationTrendPoint,
  SkillVelocity,
  JobPerformanceMetric
} from '../types/analytics';

export const analyticsService = {
  async getRecruiterDashboard(): Promise<RecruiterAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<RecruiterAnalyticsResponse>>('/api/v1/analytics/recruiter/dashboard');
    return response.data.data;
  },

  async getOverview(): Promise<RecruiterOverview> {
    const response = await apiClient.get<ApiResponse<RecruiterOverview>>('/api/v1/analytics/recruiter/overview');
    return response.data.data;
  },

  async getFunnel(): Promise<StageFunnel> {
    const response = await apiClient.get<ApiResponse<StageFunnel>>('/api/v1/analytics/recruiter/funnel');
    return response.data.data;
  },

  async getTrends(): Promise<ApplicationTrendPoint[]> {
    const response = await apiClient.get<ApiResponse<ApplicationTrendPoint[]>>('/api/v1/analytics/recruiter/trends');
    return response.data.data;
  },

  async getSkillsVelocity(): Promise<SkillVelocity[]> {
    const response = await apiClient.get<ApiResponse<SkillVelocity[]>>('/api/v1/analytics/recruiter/skills-velocity');
    return response.data.data;
  },

  async getJobPerformance(): Promise<JobPerformanceMetric[]> {
    const response = await apiClient.get<ApiResponse<JobPerformanceMetric[]>>('/api/v1/analytics/recruiter/job-performance');
    return response.data.data;
  }
};

