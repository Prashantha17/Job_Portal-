export type UserRole =
  | 'ROLE_JOB_SEEKER'
  | 'ROLE_RECRUITER'
  | 'ROLE_HR_MANAGER'
  | 'ROLE_SUPER_ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'HR_MANAGER';
  otp?: string;
}

export interface GoogleAuthPayload {
  email: string;
  firstName: string;
  lastName?: string;
  googleId?: string;
  avatarUrl?: string;
  role?: string;
}

