import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30-second timeout for file uploads, ATS analysis, and background tasks
});

// Attach JWT Bearer token automatically to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('talentflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      console.warn('Unauthorized request - session may be expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
