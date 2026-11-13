import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Building, Briefcase, Shield, KeyRound, Send, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    loginWithOtp,
    sendOtp,
    resetPassword,
    register,
    error,
    clearError,
  } = useAuth();

  // Login mode: 'otp' | 'password'
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [regOtp, setRegOtp] = useState('');
  const [isRegOtpSent, setIsRegOtpSent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // 1. Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Dispatch OTP for Login
  const handleSendLoginOtp = async () => {
    if (!loginEmail || !loginEmail.includes('@')) {
      setFormError('Please enter a valid email address first.');
      return;
    }
    setFormError(null);
    setOtpNotice(null);
    setIsSubmitting(true);
    try {
      const msg = await sendOtp(loginEmail, 'LOGIN');
      setIsOtpSent(true);
      setOtpNotice(msg || `Verification code sent to ${loginEmail}. Please check your inbox!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send OTP to email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify OTP & Sign In
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtp || loginOtp.trim().length !== 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await loginWithOtp(loginEmail, loginOtp);
    } catch (err: any) {
      setFormError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Send Forgot Password OTP
  const handleSendForgotOtp = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const msg = await sendOtp(forgotEmail, 'FORGOT_PASSWORD');
      setIsForgotOtpSent(true);
      setOtpNotice(msg || `Password reset code sent to ${forgotEmail}. Please check your inbox.`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send password reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const msg = await resetPassword(forgotEmail, forgotOtp, forgotNewPassword);
      setForgotSuccess(msg || 'Password updated successfully! You can now log in.');
      setIsForgotOtpSent(false);
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPassword('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Registration OTP Dispatch
  const handleSendRegisterOtp = async () => {
    if (!regEmail || !regEmail.includes('@')) {
      setFormError('Please enter a valid email address first.');
      return;
    }
    setFormError(null);
    setOtpNotice(null);
    setIsSubmitting(true);
    try {
      const msg = await sendOtp(regEmail, 'REGISTRATION');
      setIsRegOtpSent(true);
      setOtpNotice(msg || `Registration verification code sent to ${regEmail}. Please check your Gmail inbox!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to dispatch registration verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!isRegOtpSent) {
      await handleSendRegisterOtp();
      return;
    }
    if (!regOtp || regOtp.trim().length !== 6) {
      setFormError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setFormError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await register({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
        role: regRole,
        otp: regOtp.trim(),
      });
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setFormError(null);
    setOtpNotice(null);
    setLoginMethod('password');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-scaleUp">
        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                openAuthModal('login');
                setFormError(null);
                setOtpNotice(null);
                setForgotSuccess(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${authModalMode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                openAuthModal('register');
                setFormError(null);
                setOtpNotice(null);
                setForgotSuccess(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${authModalMode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Create Account
            </button>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* Error Message */}
          {(formError || error) && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* OTP Notification Banner */}
          {otpNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{otpNotice}</span>
            </div>
          )}

          {/* Forgot Password Success Banner */}
          {forgotSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {/* 1. LOGIN MODE */}
          {authModalMode === 'login' && (
            <div className="space-y-4">
              {/* Login Method Toggle: OTP vs Password */}
              <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setFormError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${loginMethod === 'otp'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Direct Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setFormError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${loginMethod === 'password'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Password Sign In
                </button>
              </div>

              {loginMethod === 'otp' ? (
                /* EMAIL OTP LOGIN FORM */
                <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email Address
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="aarav.sharma@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant={isOtpSent ? 'outline' : 'primary'}
                        size="sm"
                        isLoading={isSubmitting && !isOtpSent}
                        onClick={handleSendLoginOtp}
                        className="whitespace-nowrap px-4 font-bold text-xs"
                      >
                        {isOtpSent ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Resend
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" /> Send OTP
                          </span>
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      We will immediately dispatch a 6-digit verification code to your email inbox.
                    </p>
                  </div>

                  {isOtpSent && (
                    <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-2xl animate-fadeIn space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Enter 6-Digit Email OTP *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-brand-600 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="e.g. 268451"
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value)}
                            className="w-full text-center text-lg tracking-[8px] font-mono font-bold pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-brand-400 focus:border-brand-600 focus:outline-none bg-white"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        className="w-full py-2.5 font-bold shadow-md shadow-brand-500/20"
                      >
                        Verify Code & Sign In
                      </Button>
                    </div>
                  )}

                  {!isOtpSent && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      onClick={handleSendLoginOtp}
                      className="w-full py-2.5 font-bold shadow-md shadow-brand-500/20"
                    >
                      Send Verification Code to Inbox
                    </Button>
                  )}
                </form>
              ) : (
                /* PASSWORD LOGIN FORM */
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="aarav.sharma@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => openAuthModal('forgot-password')}
                        className="text-xs text-brand-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full py-2.5 font-bold shadow-md shadow-brand-500/20"
                  >
                    Sign In to TalentFlow
                  </Button>
                </form>
              )}

              {/* Quick Demo Access Bar */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Demo Access (1-Click Fill):
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('candidate@talentflow360.com', 'Candidate@123')}
                    className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-600" /> Aarav (Candidate)
                    </span>
                    <span className="text-[10px] text-slate-500">ROLE_JOB_SEEKER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickLogin('recruiter@talentflow360.com', 'Recruiter@123')}
                    className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-indigo-600" /> Priya (Recruiter)
                    </span>
                    <span className="text-[10px] text-slate-500">ROLE_RECRUITER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickLogin('admin@talentflow360.com', 'Admin@123456')}
                    className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-600" /> Super Admin
                    </span>
                    <span className="text-[10px] text-slate-500">ROLE_SUPER_ADMIN</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. FORGOT PASSWORD MODE */}
          {authModalMode === 'forgot-password' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Reset Password via Email OTP</h3>
                  <p className="text-[11px] text-slate-500">Enter your email to receive a secure verification code</p>
                </div>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="aarav.sharma@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant={isForgotOtpSent ? 'outline' : 'primary'}
                      size="sm"
                      isLoading={isSubmitting && !isForgotOtpSent}
                      onClick={handleSendForgotOtp}
                      className="whitespace-nowrap px-4 font-bold text-xs"
                    >
                      {isForgotOtpSent ? 'Resend' : 'Send Code'}
                    </Button>
                  </div>
                </div>

                {isForgotOtpSent && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        6-Digit Reset Code (From Email Inbox) *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 000000"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-mono tracking-widest font-bold focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Password (Min 8 characters) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          placeholder="Enter your new secure password"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      className="w-full py-2.5 font-bold shadow-md shadow-brand-500/20"
                    >
                      Reset Password & Return to Login
                    </Button>
                  </>
                )}
              </form>
            </div>
          )}

          {/* 3. REGISTER MODE */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRegRole('JOB_SEEKER')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${regRole === 'JOB_SEEKER'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-xs text-slate-900">Job Seeker</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Apply for roles in Indian tech hubs & track ATS pipeline</p>
                  </div>

                  <div
                    onClick={() => setRegRole('RECRUITER')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${regRole === 'RECRUITER'
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">Recruiter</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Post jobs in ₹ LPA & screen applicants across 10 ATS stages</p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email with Send Verification Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Gmail / Work Email) *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="aarav.sharma@gmail.com"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (isRegOtpSent) setIsRegOtpSent(false);
                      }}
                      className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant={isRegOtpSent ? 'outline' : 'primary'}
                    size="md"
                    isLoading={isSubmitting && !isRegOtpSent}
                    onClick={handleSendRegisterOtp}
                    className="whitespace-nowrap px-4 text-xs font-bold shrink-0"
                  >
                    {isRegOtpSent ? 'Resend' : 'Send Code'}
                  </Button>
                </div>
              </div>

              {/* 6-Digit Email Verification Code Input */}
              {isRegOtpSent && (
                <div className="animate-fadeIn p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-emerald-950">
                      6-Digit Email Verification Code *
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent to your Gmail
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 000000"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white font-mono tracking-widest font-bold focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Check your Gmail inbox for the 6-digit verification code to activate your account.
                  </p>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password (min 8 characters) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone with Indian Prefix */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Indian Mobile)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-600 select-none flex items-center gap-1">
                    <span>🇮🇳</span> +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-sm pl-[4.3rem] pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1"></p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full py-2.5 font-bold shadow-md shadow-brand-500/20"
              >
                {isRegOtpSent ? 'Verify Code & Complete Registration' : 'Send OTP & Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
