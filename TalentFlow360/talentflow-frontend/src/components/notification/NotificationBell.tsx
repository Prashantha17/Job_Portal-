import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, CheckCheck, Trash2, Calendar, Award, UserCheck,
  Briefcase, Sparkles, BellOff, X, Zap, RefreshCw
} from 'lucide-react';
import { NotificationItem } from '../../types/notification';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationBellProps {
  onNavigate?: (url: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    isWsConnected,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestAlert,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [testSending, setTestSending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markAsRead(item.id);
    }
    setIsOpen(false);

    if (item.actionUrl) {
      if (onNavigate) {
        onNavigate(item.actionUrl);
      } else {
        window.location.hash = item.actionUrl;
      }
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setTestSending(true);
      await sendTestAlert(
        'Live WebSocket Alert ⚡',
        'Your STOMP real-time notification channel is live! Instant updates are active.'
      );
    } finally {
      setTestSending(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'OFFER_RELEASED':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        );
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_RESCHEDULED':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'INTERVIEW_FEEDBACK_SUBMITTED':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'JOB_APPLICATION_RECEIVED':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case 'APPLICATION_STATUS_UPDATED':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        title={isWsConnected ? 'Notifications (Real-Time Live WebSocket)' : 'Notifications'}
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Real-time live pulse badge indicator */}
        {isWsConnected && (
          <span
            className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
            title="Live WebSocket Connected"
          />
        )}

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full ring-2 ring-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">Notifications</h3>
                {isWsConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live WS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    Polling
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar: Test Live Alert & Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'unread'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Test Push Button */}
            <button
              onClick={handleSendTestNotification}
              disabled={testSending}
              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Send a real-time WebSocket push alert to test your connection"
            >
              <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>{testSending ? 'Pinging...' : 'Test Live Push'}</span>
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeTab === 'unread' ? 'You have read all your alerts!' : 'Updates and alerts will appear here in real-time.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer relative group ${
                    !n.read ? 'bg-brand-50/25' : ''
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(n.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className={`text-xs font-bold leading-tight truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>{n.timeAgo || 'Recently'}</span>
                      {n.actionUrl && (
                        <>
                          <span>&bull;</span>
                          <span className="text-brand-600 font-semibold group-hover:underline">
                            Click to open
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions (Mark as read / delete) */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-white transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread indicator dot */}
                  {!n.read && (
                    <span className="absolute right-3 top-4 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-brand-100 group-hover:opacity-0 transition-opacity" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
