import React, { useState } from 'react';
import {
  Layers, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2,
  Shield, KeyRound
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleAccountModal } from '../components/auth/GoogleAccountModal';
import { FirebaseConfigModal } from '../components/auth/FirebaseConfigModal';
import { isFirebaseConfigured, signInWithGoogleReal } from '../config/firebase';

interface LoginPageProps {
  onNavigateHome?: () => void;
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateHome,
  onNavigateRegister,
  onNavigateForgotPassword,
}) => {
  const { login, loginWithGoogle, loginWithOtp, sendOtp, error, clearError } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
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

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    clearError();

    if (isFirebaseConfigured()) {
      try {
        setGoogleLoading(true);
        const payload = await signInWithGoogleReal('ROLE_JOB_SEEKER');
        await loginWithGoogle(payload);
        if (onNavigateHome) onNavigateHome();
        else window.location.hash = '#home';
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          // User closed popup without signing in
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
          setGoogleError(err.message || 'Google sign-in failed. Please try again.');
        }
      } finally {
        setGoogleLoading(false);
      }
    } else {
      // Firebase not attached yet - open setup dialog
      setIsFirebaseModalOpen(true);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      clearError();
      await login({ email, password });
      if (onNavigateHome) onNavigateHome();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;
    try {
      setOtpSending(true);
      clearError();
      const msg = await sendOtp(email, 'LOGIN');
      setOtpSent(true);
      setOtpMessage(msg || 'Verification code sent to your inbox.');
      // Extract OTP if present in message or response
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

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    try {
      setLoading(true);
      clearError();
      await loginWithOtp(email, otp);
      if (onNavigateHome) onNavigateHome();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCandidate = () => {
    setEmail('alex.morgan@example.com');
    setPassword('Candidate@123');
    setLoginMethod('password');
  };

  const fillDemoRecruiter = () => {
    setEmail('sarah.jenkins@example.com');
    setPassword('Recruiter@123');
    setLoginMethod('password');
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
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-700 via-brand-800 to-indigo-900 p-10 text-white flex-col justify-between relative overflow-hidden">
            {/* Background glowing blur decorative circles */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Brand Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-xl tracking-tight">
                  TalentFlow<span className="text-brand-300">360</span>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight leading-snug mb-3">
                Accelerate Your Tech Career Journey
              </h2>
              <p className="text-brand-100 text-xs leading-relaxed mb-8">
                Connect with leading technology employers across India, tailor your resume with AI, and track every interview stage in real-time.
              </p>

              {/* Value props */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Smart Matching & Sourcing</strong>
                    <span className="text-brand-200 text-[11px]">Algorithmic 4-part fit scoring and intelligent candidate recommendations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">10-Stage ATS Pipeline</strong>
                    <span className="text-brand-200 text-[11px]">Clear, transparent tracking from application to offer letter.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-300" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Verified Indian Tech Hubs</strong>
                    <span className="text-brand-200 text-[11px]">Top engineering openings in Bengaluru, Hyderabad & Pune.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-[11px] text-brand-200">
              Trusted by 10,000+ candidates and top Indian tech recruitment squads.
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
                  Sign In to TalentFlow 360
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Access your profile, job applications, ATS pipeline & hiring operations.
                </p>
              </div>

              {/* 1. Google Sign-In Button */}
              {googleError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
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
                  {googleLoading ? 'Connecting to Google OAuth...' : 'Continue with Google'}
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
                  Or continue with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Tab Selector: Password vs OTP */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    clearError();
                  }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${loginMethod === 'password'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                    }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    clearError();
                  }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${loginMethod === 'otp'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                    }`}
                >
                  Instant OTP Login
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {/* Method 1: Password Form */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={
                          onNavigateForgotPassword
                            ? onNavigateForgotPassword
                            : () => (window.location.hash = '#forgot-password')
                        }
                        className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl shadow-sm"
                  >
                    Sign In with Password
                  </Button>
                </form>
              )}

              {/* Method 2: OTP Form */}
              {loginMethod === 'otp' && (
                <form onSubmit={handleOtpLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-24 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!email || otpSending}
                        className="absolute right-2 top-2 px-2.5 py-1 text-[11px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {otpSending ? 'Sending...' : otpSent ? 'Resend' : 'Send Code'}
                      </button>
                    </div>
                    {otpMessage && (
                      <p className="text-[11px] text-emerald-600 mt-1">{otpMessage}</p>
                    )}
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        6-Digit Email Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>
                      {devOtpCode && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
                          <span>Test Code: <strong>{devOtpCode}</strong></span>
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!otpSent}
                    isLoading={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl shadow-sm disabled:opacity-50"
                  >
                    Verify OTP & Sign In
                  </Button>
                </form>
              )}

              {/* Quick Demo Login Chips */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  1-Click Test Demo Credentials
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoCandidate}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-bold text-slate-900 group-hover:text-brand-600">
                      Alex Morgan
                    </span>
                    <span className="block text-[10px] text-slate-500">Candidate / Developer</span>
                  </button>

                  <button
                    type="button"
                    onClick={fillDemoRecruiter}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-[11px] font-bold text-slate-900 group-hover:text-indigo-600">
                      Sarah Jenkins
                    </span>
                    <span className="block text-[10px] text-slate-500">Recruiter @ Apex Global</span>
                  </button>
                </div>
              </div>

              {/* Bottom register link */}
              <div className="mt-6 text-center text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={
                    onNavigateRegister
                      ? onNavigateRegister
                      : () => (window.location.hash = '#register')
                  }
                  className="font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Create an account &rarr;
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
          else window.location.hash = '#home';
        }}
        onSwitchToDemo={() => setIsGoogleModalOpen(true)}
        targetRole="ROLE_JOB_SEEKER"
      />

      {/* Google Sign-In Account Selector Modal (Demo Fallback) */}
      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          if (onNavigateHome) onNavigateHome();
          else window.location.hash = '#home';
        }}
        onSwitchToFirebase={() => setIsFirebaseModalOpen(true)}
      />
    </div>
  );
};
