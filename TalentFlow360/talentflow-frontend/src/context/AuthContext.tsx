import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginPayload, RegisterPayload, GoogleAuthPayload } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  sendOtp: (email: string, purpose?: 'LOGIN' | 'FORGOT_PASSWORD' | 'REGISTRATION') => Promise<string>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<string>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot-password';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      // Verify token with backend
      authService.getCurrentUser().then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
        } else {
          authService.logout();
          setUser(null);
        }
      });
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (payload: GoogleAuthPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.loginWithGoogle(payload);
      setUser({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.loginWithOtp(email, otp);
      setUser({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string, purpose: 'LOGIN' | 'FORGOT_PASSWORD' | 'REGISTRATION' = 'LOGIN'): Promise<string> => {
    setError(null);
    try {
      return await authService.sendOtp(email, purpose);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to dispatch verification code to email.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<string> => {
    setError(null);
    try {
      return await authService.resetPasswordWithOtp({ email, otp, newPassword });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(payload);
      setUser({
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check the form fields.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthModalMode(mode);
    setError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        loginWithGoogle,
        loginWithOtp,
        sendOtp,
        resetPassword,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

