import apiClient from './api';
import { ApiResponse, HealthResponse } from '../types/health';

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<ApiResponse<HealthResponse>>('/api/v1/health');
    return response.data.data;
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get<ApiResponse<{ status: string; timestamp: string }>>('/api/v1/health/ping');
    return response.data.data;
  },

  async checkDatabase(): Promise<{ databaseStatus: string; databaseProduct: string }> {
    const response = await apiClient.get<ApiResponse<{ databaseStatus: string; databaseProduct: string }>>('/api/v1/health/db');
    return response.data.data;
  }
};

