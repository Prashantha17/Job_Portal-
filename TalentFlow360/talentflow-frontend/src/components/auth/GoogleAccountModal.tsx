import React, { useState } from 'react';
import { X, User, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthPayload } from '../../types/auth';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToFirebase?: () => void;
  defaultRole?: 'JOB_SEEKER' | 'RECRUITER';
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToFirebase,
  defaultRole = 'JOB_SEEKER',
}) => {
  const { loginWithGoogle } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'JOB_SEEKER' | 'RECRUITER'>(defaultRole);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (payload: GoogleAuthPayload) => {
    try {
      setLoadingEmail(payload.email);
      setError(null);
      await loginWithGoogle({
        ...payload,
        role: payload.role || (selectedRole === 'RECRUITER' ? 'ROLE_RECRUITER' : 'ROLE_JOB_SEEKER'),
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) {
      setError('Please provide your name and Gmail address.');
      return;
    }
    const parts = customName.trim().split(' ');
    const firstName = parts[0] || 'Google';
    const lastName = parts.slice(1).join(' ') || 'User';

    handleSelectAccount({
      email: customEmail.trim().toLowerCase(),
      firstName,
      lastName,
      googleId: 'google_' + Date.now(),
      role: selectedRole === 'RECRUITER' ? 'ROLE_RECRUITER' : 'ROLE_JOB_SEEKER',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Google 4-Color SVG Logo */}
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                to continue to <strong className="text-slate-800">TalentFlow 360</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {!showCustomForm ? (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Choose an account:
              </div>

              {/* Pre-populated Google Account 1: Alex Morgan */}
              <button
                onClick={() =>
                  handleSelectAccount({
                    email: 'alex.morgan@example.com',
                    firstName: 'Alex',
                    lastName: 'Morgan',
                    googleId: 'google_alex_123',
                    role: selectedRole === 'RECRUITER' ? 'ROLE_RECRUITER' : 'ROLE_JOB_SEEKER',
                  })
                }
                disabled={loadingEmail !== null}
                className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-brand-500 hover:bg-slate-50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    A
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 block">
                      Alex Morgan
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      alex.morgan@example.com
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Candidate Portfolio
                    </span>
                  </div>
                </div>
                {loadingEmail === 'alex.morgan@example.com' ? (
                  <span className="text-xs text-brand-600 font-semibold animate-pulse">
                    Connecting...
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>

              {/* Pre-populated Google Account 2: Sarah Jenkins */}
              <button
                onClick={() =>
                  handleSelectAccount({
                    email: 'sarah.jenkins@example.com',
                    firstName: 'Sarah',
                    lastName: 'Jenkins',
                    googleId: 'google_sarah_456',
                    role: 'ROLE_RECRUITER',
                  })
                }
                disabled={loadingEmail !== null}
                className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-brand-500 hover:bg-slate-50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    S
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 block">
                      Sarah Jenkins
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      sarah.jenkins@example.com
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" /> Verified Recruiter @ Apex Global
                    </span>
                  </div>
                </div>
                {loadingEmail === 'sarah.jenkins@example.com' ? (
                  <span className="text-xs text-brand-600 font-semibold animate-pulse">
                    Connecting...
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>

              {/* Option 3: Use another Google account */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/30 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-brand-600" />
                Use another Google account
              </button>
            </>
          ) : (
            /* Custom Google Email Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">
                  Enter Google Account Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-[11px] text-brand-600 hover:underline cursor-pointer"
                >
                  &larr; Back to accounts
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gmail / Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Purpose
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('JOB_SEEKER')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      selectedRole === 'JOB_SEEKER'
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('RECRUITER')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      selectedRole === 'RECRUITER'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingEmail !== null}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingEmail ? 'Connecting to Google...' : 'Continue with Google Account'}
              </button>
            </form>
          )}

          {/* Switch to Real Firebase Button if provided */}
          {onSwitchToFirebase && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToFirebase();
                }}
                className="w-full py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200 text-orange-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🔥</span> Attach Firebase for Real Google OAuth Popup &rarr;
              </button>
            </div>
          )}

          {/* Privacy disclaimer */}
          <div className="pt-3 border-t border-slate-100 text-[10.5px] text-slate-400 leading-normal">
            To continue, Google will share your verified name, email address, language preference, and profile details with TalentFlow 360.
          </div>
        </div>
      </div>
    </div>
  );
};

