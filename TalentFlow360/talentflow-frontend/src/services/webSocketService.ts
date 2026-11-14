import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import { NotificationItem } from '../types/notification';

export type NotificationCallback = (notification: NotificationItem) => void;
export type UnreadCountCallback = (count: number) => void;

class WebSocketService {
  private client: Client | null = null;
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private unreadCountCallbacks: Set<UnreadCountCallback> = new Set();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private isConnecting: boolean = false;
  private connected: boolean = false;

  public connect(): void {
    if (this.client?.active || this.isConnecting) {
      return;
    }

    const token = localStorage.getItem('talentflow_token');
    const userStr = localStorage.getItem('talentflow_user');
    let userEmail = '';

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userEmail = u.email || '';
      } catch (e) {
        console.warn('Could not parse user for WebSocket connection:', e);
      }
    }

    // Determine WS broker URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsProtocol = apiUrl.startsWith('https') ? 'wss://' : 'ws://';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const brokerURL = `${wsProtocol}${host}/ws`;

    this.isConnecting = true;

    const connectHeaders: Record<string, string> = {};
    if (token) {
      connectHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (userEmail) {
      connectHeaders['user'] = userEmail;
    }

    const config: StompConfig = {
      brokerURL,
      connectHeaders,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.connected = true;
        this.isConnecting = false;
        console.log('🟢 [TalentFlow WebSocket] Connected to STOMP Broker at', brokerURL);
        this.notifyConnectionState(true);

        // 1. Subscribe to user private notification queue
        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => {
          try {
            const data: NotificationItem = JSON.parse(message.body);
            console.log('🔔 [TalentFlow WebSocket] Received private notification:', data);
            this.notificationCallbacks.forEach(cb => cb(data));
          } catch (err) {
            console.warn('Failed to parse STOMP notification message:', err);
          }
        });

        // 2. Subscribe to user private unread count queue
        this.client?.subscribe('/user/queue/unread-count', (message: IMessage) => {
          try {
            const count = Number(message.body);
            if (!isNaN(count)) {
              this.unreadCountCallbacks.forEach(cb => cb(count));
            }
          } catch (err) {
            console.warn('Failed to parse unread count message:', err);
          }
        });

        // 3. Subscribe to public notifications broadcast topic
        this.client?.subscribe('/topic/notifications', (message: IMessage) => {
          try {
            const data: NotificationItem = JSON.parse(message.body);
            // Public notifications can be filtered or shown
            console.log('📢 [TalentFlow WebSocket] Public broadcast notification:', data);
          } catch (err) {
            console.warn('Failed to parse broadcast notification:', err);
          }
        });
      },

      onDisconnect: () => {
        this.connected = false;
        this.isConnecting = false;
        console.log('🔴 [TalentFlow WebSocket] Disconnected from STOMP Broker');
        this.notifyConnectionState(false);
      },

      onStompError: (frame) => {
        console.warn('⚠️ [TalentFlow WebSocket] Broker error:', frame.headers['message'], frame.body);
        this.connected = false;
        this.isConnecting = false;
        this.notifyConnectionState(false);
      },

      onWebSocketClose: () => {
        this.connected = false;
        this.isConnecting = false;
        this.notifyConnectionState(false);
      },
    };

    this.client = new Client(config);
    this.client.activate();
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.isConnecting = false;
      this.notifyConnectionState(false);
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  public onUnreadCount(callback: UnreadCountCallback): () => void {
    this.unreadCountCallbacks.add(callback);
    return () => {
      this.unreadCountCallbacks.delete(callback);
    };
  }

  public onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    callback(this.connected);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnectionState(connected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;

