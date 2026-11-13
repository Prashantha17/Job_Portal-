export type NotificationType =
  | 'APPLICATION_STATUS_UPDATED'
  | 'JOB_APPLICATION_RECEIVED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_RESCHEDULED'
  | 'INTERVIEW_FEEDBACK_SUBMITTED'
  | 'OFFER_RELEASED'
  | 'SYSTEM_ALERT';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  metadata?: string;
  createdAt: string;
  readAt?: string;
  timeAgo: string;
}

export interface NotificationSummary {
  unreadCount: number;
  notifications: NotificationItem[];
}

