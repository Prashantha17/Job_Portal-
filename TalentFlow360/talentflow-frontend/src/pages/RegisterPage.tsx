import React, { useState } from 'react';
import {
  Layers, ArrowLeft, Mail, Lock, User, Briefcase, Eye, EyeOff,
  Sparkles, CheckCircle2, Shield, KeyRound, Phone
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleAccountModal } from '../components/auth/GoogleAccountModal';
import { FirebaseConfigModal } from '../components/auth/FirebaseConfigModal';
import { isFirebaseConfigured, signInWithGoogleReal } from '../config/firebase';

interface RegisterPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateHome,
  onNavigateLogin,
}) => {
  const { register, loginWithGoogle, sendOtp, error, clearError } = useAuth();
  const [role, setRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState<boolean>(isFirebaseConfigured());

  const handleGoogleSignUp = async () => {
    setGoogleError(null);
    clearError();

    const targetRole = role === 'RECRUITER' ? 'ROLE_RECRUITER' : 'ROLE_JOB_SEEKER';

    if (isFirebaseConfigured()) {
      try {
        setGoogleLoading(true);
        const payload = await signInWithGoogleReal(targetRole);
        await loginWithGoogle(payload);
        if (onNavigateHome) onNavigateHome();
        else window.location.hash = role === 'RECRUITER' ? '#recruiter-hub' : '#candidate-hub';
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return;
        }
        if (
          err.code === 'auth/unauthorized-domain' ||
          err.code === 'auth/configuration-not-found' ||
          err.code === 'auth/operation-not-allowed' ||
          err.message?.includes('FIREBASE_NOT_CONFIGURED')
        ) {
          setIsFirebaseModalOpen(true);
        } else {
          setGoogleError(err.message || 'Google sign-up failed. Please try again.');
        }
      } finally {
        setGoogleLoading(false);
      }
    } else {
      setIsFirebaseModalOpen(true);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;
    try {
      setOtpSending(true);
      clearError();
      const msg = await sendOtp(email, 'REGISTRATION');
      setOtpSent(true);
      setOtpMessage(msg || 'Verification code sent to your inbox.');
      const match = msg.match(/\b\d{6}\b/);
      if (match) {
        setDevOtpCode(match[0]);
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setOtpSending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !otp) return;

    try {
      setLoading(true);
      clearError();
      await register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        otp,
      });
      if (onNavigateHome) onNavigateHome();
      else window.location.hash = role === 'RECRUITER' ? '#recruiter-hub' : '#candidate-hub';
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="max-w-5xl mx-auto w-full px-4 mb-4">
        <button
          onClick={onNavigateHome ? onNavigateHome : () => (window.location.hash = '#home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero Sidebar (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-800 via-brand-800 to-brand-900 p-10 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-xl tracking-tight">
                  TalentFlow<span className="text-brand-300">360</span>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight leading-snug mb-3">
                {role === 'JOB_SEEKER'
                  ? 'Land Your Dream Engineering Role'
                  : 'Hire India\'s Top 1% Engineering Talent'}
              </h2>
              <p className="text-brand-100 text-xs leading-relaxed mb-8">
                {role === 'JOB_SEEKER'
                  ? 'Join thousands of engineers who use TalentFlow 360 to craft AI resumes, connect directly with verified recruiters, and get hired.'
                  : 'Post vacancies with clear INR/LPA compensation, manage multi-round interview scorecards, and streamline your 10-stage hiring pipeline.'}
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">1-Click Google Registration</strong>
                    <span className="text-brand-200 text-[11px]">Instant verified account creation without waiting.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Verified Indian Tech Employers</strong>
                    <span className="text-brand-200 text-[11px]">Direct recruiter connections across Bengaluru, Hyderabad & Pune.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">
                      {role === 'JOB_SEEKER' ? 'AI Resume Builder & Scorecards' : 'Smart ATS Candidate Matching'}
                    </strong>
                    <span className="text-brand-200 text-[11px]">
                      {role === 'JOB_SEEKER'
                        ? '10 ATS designer templates with vector PDF export.'
                        : 'Algorithmic candidate fit scoring by technical skills, experience & CTC budget.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-[11px] text-brand-200">
              Free forever for candidates. Enterprise hiring packages for recruiters.
            </div>
          </div>

          {/* Right Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Form Header */}
              <div className="mb-6">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-slate-900">TalentFlow 360</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Create Your Free Account
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your role below to start applying or recruiting.
                </p>
              </div>

              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setRole('JOB_SEEKER')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${role === 'JOB_SEEKER'
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${role === 'JOB_SEEKER' ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900">Candidate</span>
                  </div>
                  <span className="text-[10.5px] text-slate-500 block">I want to find a job</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${role === 'RECRUITER'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className={`w-4 h-4 ${role === 'RECRUITER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900">Employer</span>
                  </div>
                  <span className="text-[10.5px] text-slate-500 block">I want to hire talent</span>
                </button>
              </div>

              {/* 1. Google Sign-Up Button */}
              {googleError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm cursor-pointer mb-2 group disabled:opacity-60"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span className="group-hover:text-slate-900">
                  {googleLoading
                    ? 'Connecting to Google OAuth...'
                    : `Sign up with Google as ${role === 'JOB_SEEKER' ? 'Candidate' : 'Employer'}`}
                </span>
              </button>

              {/* Firebase Connection Indicator & Config Link */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-5 px-1">
                <span className="flex items-center gap-1.5">
                  {hasFirebaseConfig ? (
                    <>

                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-500">Firebase not attached yet</span>
                    </>
                  )}
                </span>

              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Or register with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {/* Email Registration Form */}
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* First and Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Priya"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work or Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya.sharma@example.com"
                      className="w-full pl-9 pr-24 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!email || otpSending}
                      className="absolute right-1.5 top-1.5 px-2.5 py-1 text-[10.5px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                  {otpMessage && (
                    <p className="text-[11px] text-emerald-600 mt-1">{otpMessage}</p>
                  )}
                </div>

                {/* OTP Field */}
                {otpSent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit Email Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full pl-9 pr-4 py-2 text-xs font-mono font-bold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    {devOtpCode && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
                        <span>Test OTP: <strong>{devOtpCode}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtp(devOtpCode)}
                          className="font-bold text-amber-900 underline ml-2"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Phone (+91) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!otpSent}
                  isLoading={loading}
                  className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl shadow-sm disabled:opacity-50"
                >
                  Create {role === 'JOB_SEEKER' ? 'Candidate' : 'Employer'} Account
                </Button>
              </form>

              {/* Bottom sign-in link */}
              <div className="mt-6 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={
                    onNavigateLogin
                      ? onNavigateLogin
                      : () => (window.location.hash = '#login')
                  }
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Sign in here &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Firebase Configuration Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => {
          setIsFirebaseModalOpen(false);
          setHasFirebaseConfig(isFirebaseConfigured());
        }}
        onSuccess={() => {
          setHasFirebaseConfig(true);
          if (onNavigateHome) onNavigateHome();
          else window.location.hash = role === 'RECRUITER' ? '#recruiter-hub' : '#candidate-hub';
        }}
        onSwitchToDemo={() => setIsGoogleModalOpen(true)}
        targetRole={role === 'RECRUITER' ? 'ROLE_RECRUITER' : 'ROLE_JOB_SEEKER'}
      />

      {/* Google Sign-In Account Selector Modal (Demo Fallback) */}
      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        defaultRole={role}
        onSuccess={() => {
          if (onNavigateHome) onNavigateHome();
          else window.location.hash = role === 'RECRUITER' ? '#recruiter-hub' : '#candidate-hub';
        }}
        onSwitchToFirebase={() => setIsFirebaseModalOpen(true)}
      />
    </div>
  );
};

