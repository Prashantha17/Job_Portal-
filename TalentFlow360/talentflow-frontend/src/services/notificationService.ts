import apiClient from './api';
import { NotificationSummary, NotificationItem } from '../types/notification';

export const notificationService = {
  /**
   * Fetch current user's notifications and unread count
   */
  async getNotifications(): Promise<NotificationSummary> {
    const response = await apiClient.get('/api/v1/notifications');
    return response.data.data;
  },

  /**
   * Fetch lightweight unread notification count for badge
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/api/v1/notifications/unread-count');
    return response.data.data;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: number): Promise<NotificationItem> {
    const response = await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<number> {
    const response = await apiClient.patch('/api/v1/notifications/read-all');
    return response.data.data;
  },

  /**
   * Delete / dismiss a notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${id}`);
  },
};

export default notificationService;

