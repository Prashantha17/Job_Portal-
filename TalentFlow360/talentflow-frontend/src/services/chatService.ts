import apiClient from './api';
import { ChatMessage, SendMessagePayload, ConstructiveFeedback } from '../types/chat';

export const chatService = {
  // Fetch full conversation history for an application
  getChatHistory: async (applicationId: number): Promise<ChatMessage[]> => {
    const res = await apiClient.get<{ success: boolean; data: ChatMessage[] }>(
      `/api/v1/chat/applications/${applicationId}`
    );
    return res.data.data;
  },

  // Send message in an application conversation
  sendMessage: async (payload: SendMessagePayload): Promise<ChatMessage> => {
    const res = await apiClient.post<{ success: boolean; data: ChatMessage }>(
      '/api/v1/chat/send',
      payload
    );
    return res.data.data;
  },

  // Get total unread chat messages for logged-in user
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ success: boolean; data: number }>(
      '/api/v1/chat/unread-count'
    );
    return res.data.data;
  },

  // Mark all messages as read for an application
  markAsRead: async (applicationId: number): Promise<void> => {
    await apiClient.patch(`/api/v1/chat/applications/${applicationId}/read`);
  },

  // Get constructive feedback & skill gap analysis for an application
  getConstructiveFeedback: async (applicationId: number): Promise<ConstructiveFeedback> => {
    const res = await apiClient.get<{ success: boolean; data: ConstructiveFeedback }>(
      `/api/v1/applications/${applicationId}/constructive-feedback`
    );
    return res.data.data;
  },
};

export default chatService;
