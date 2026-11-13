import apiClient from './api';
import { ApiResponse } from '../types/health';
import { AuthResponseData, AuthUser, LoginPayload, RegisterPayload, GoogleAuthPayload } from '../types/auth';

const TOKEN_KEY = 'talentflow_token';
const REFRESH_TOKEN_KEY = 'talentflow_refresh_token';
const USER_KEY = 'talentflow_user';

export const authService = {
  async loginWithGoogle(payload: GoogleAuthPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/api/v1/auth/google', payload);
    const data = response.data.data;

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      })
    );

    return data;
  },

  async login(credentials: LoginPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/api/v1/auth/login', credentials);
    const data = response.data.data;

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      })
    );

    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/api/v1/auth/register', payload);
    const data = response.data.data;

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      })
    );

    return data;
  },

  async sendOtp(email: string, purpose: 'LOGIN' | 'FORGOT_PASSWORD' | 'REGISTRATION' = 'LOGIN'): Promise<string> {
    const response = await apiClient.post<ApiResponse<string>>('/api/v1/auth/send-otp', { email, purpose });
    return response.data.message;
  },

  async loginWithOtp(email: string, otp: string): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/api/v1/auth/login-otp', { email, otp });
    const data = response.data.data;

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      })
    );

    return data;
  },

  async resetPasswordWithOtp(payload: { email: string; otp: string; newPassword: string }): Promise<string> {
    const response = await apiClient.post<ApiResponse<string>>('/api/v1/auth/forgot-password/verify', payload);
    return response.data.message;
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/api/v1/auth/refresh', {
        refreshToken,
      });
      const data = response.data.data;
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      return data.accessToken;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<ApiResponse<AuthUser>>('/api/v1/auth/me');
      return response.data.data;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

