import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types/notification';
import notificationService from '../services/notificationService';
import webSocketService from '../services/webSocketService';
import { useAuth } from './AuthContext';

export interface LiveToast {
  id: string;
  notification: NotificationItem;
  createdAt: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isWsConnected: boolean;
  toasts: LiveToast[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  sendTestAlert: (title?: string, message?: string) => Promise<void>;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API soft notification chime (zero external dependencies)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    // Audio context may be restricted before first user interaction
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications from REST API:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  // WebSocket Connection & Real-Time Event Handlers
  useEffect(() => {
    if (!isAuthenticated) {
      webSocketService.disconnect();
      setIsWsConnected(false);
      return;
    }

    // Connect to STOMP WebSocket broker
    webSocketService.connect();

    const unsubConnection = webSocketService.onConnectionChange((connected) => {
      setIsWsConnected(connected);
    });

    // Listen for live push notifications
    const unsubNotifications = webSocketService.onNotification((newNotif: NotificationItem) => {
      // 1. Prepend to in-memory notification list
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        return exists ? prev : [newNotif, ...prev];
      });

      // 2. Increment unread count
      setUnreadCount((prev) => prev + 1);

      // 3. Play soft notification sound
      playNotificationChime();

      // 4. Trigger top-right floating toast banner
      const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      setToasts((prev) => [...prev, { id: toastId, notification: newNotif, createdAt: Date.now() }]);

      // 5. Auto-dismiss toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 6000);
    });

    // Listen for live unread count updates
    const unsubUnread = webSocketService.onUnreadCount((count: number) => {
      setUnreadCount(count);
    });

    return () => {
      unsubConnection();
      unsubNotifications();
      unsubUnread();
      webSocketService.disconnect();
    };
  }, [isAuthenticated, user?.email]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      const item = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (item && !item.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const sendTestAlert = async (title?: string, message?: string) => {
    try {
      await notificationService.sendTestNotification(title, message);
    } catch (err) {
      console.warn('Failed to dispatch test notification:', err);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isWsConnected,
        toasts,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendTestAlert,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

