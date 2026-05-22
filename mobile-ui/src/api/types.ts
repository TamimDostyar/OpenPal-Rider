export interface CreateUserRequest {
  name: string;
  email: string;
  dob: string; // YYYY-MM-DD
  school: string; // must be a recognized US university
  graduationDate: string; // YYYY-MM-DD
  phoneNumber: number;
  password: string;
}

export interface CreateUserResponse {
  email: string;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string; // 4-digit code
}

export interface VerifyEmailResponse {
  id: string;
  name: string;
  userSpecialNumber: number;
  username: string;
  email: string;
  dob: string;
  school: string;
  graduationDate: string;
  PhoneNumber: number; // backend returns this key with a capital P
  emailVerified: boolean;
  message: string;
}

export interface ResendCodeResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  username?: string; // accepted by the backend but ignored
}

export interface LoginResponse {
  token: string; // JWT, expires in 1 hour
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string; // returned only when an account exists (dev behaviour)
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface University {
  name: string;
  url: string;
}

export interface UniversitiesResponse {
  count: number;
  universities: University[];
}
