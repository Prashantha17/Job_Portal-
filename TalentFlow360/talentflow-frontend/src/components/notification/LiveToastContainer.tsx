import React from 'react';
import {
  CheckCircle2, Calendar, Award, Briefcase,
  Sparkles, X, ArrowRight, Zap
} from 'lucide-react';
import { useNotifications, LiveToast } from '../../context/NotificationContext';
import { NotificationType } from '../../types/notification';

export const LiveToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'OFFER_RELEASED':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_RESCHEDULED':
        return <Calendar className="w-5 h-5 text-teal-600" />;
      case 'JOB_APPLICATION_RECEIVED':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'APPLICATION_STATUS_UPDATED':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'INTERVIEW_FEEDBACK_SUBMITTED':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-amber-500" />;
    }
  };

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case 'OFFER_RELEASED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_RESCHEDULED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'JOB_APPLICATION_RECEIVED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'APPLICATION_STATUS_UPDATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleAction = (toast: LiveToast) => {
    if (toast.notification.actionUrl) {
      window.location.hash = toast.notification.actionUrl;
    }
    dismissToast(toast.id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const notif = toast.notification;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-4 transition-all duration-300 animate-slideInRight overflow-hidden relative group hover:shadow-brand-500/10"
          >
            {/* Top decorative animated gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 animate-pulse" />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(notif.type)} uppercase tracking-wider`}>
                    Live Alert
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {notif.title}
                </h4>

                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                {notif.actionUrl && (
                  <button
                    onClick={() => handleAction(toast)}
                    className="mt-2 text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer group-hover:underline"
                  >
                    View in Portal <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
