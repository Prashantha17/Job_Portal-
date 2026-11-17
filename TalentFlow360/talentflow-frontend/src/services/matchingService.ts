import apiClient from './api';
import { ApiResponse } from '../types/health';
import { CandidateMatch, JobRecommendation } from '../types/matching';

export const matchingService = {
  /**
   * Get personalized job recommendations for the logged-in candidate
   */
  async getCandidateRecommendations(limit: number = 15): Promise<JobRecommendation[]> {
    const response = await apiClient.get<ApiResponse<JobRecommendation[]>>(
      `/api/v1/matching/candidate/recommendations?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get top ranked candidate matches from the talent pool for a job
   */
  async getTopMatchedCandidatesForJob(jobId: number, limit: number = 20): Promise<CandidateMatch[]> {
    const response = await apiClient.get<ApiResponse<CandidateMatch[]>>(
      `/api/v1/matching/jobs/${jobId}/candidates?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get scored applicants for a specific job
   */
  async getJobApplicantMatches(jobId: number): Promise<CandidateMatch[]> {
    const response = await apiClient.get<ApiResponse<CandidateMatch[]>>(
      `/api/v1/matching/jobs/${jobId}/applicants`
    );
    return response.data.data;
  }
};
