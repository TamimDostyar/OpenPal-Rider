/**
 * Request and response payload types for the backend REST API. Mirrors the
 * Java DTOs so the client can call endpoints with full type safety.
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  dob: string;
  school: string;
  graduationDate: string;
  phoneNumber: number;
  password: string;
}

export interface CreateUserResponse {
  email: string;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
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
  PhoneNumber: number;
  emailVerified: boolean;
  message: string;
}

export interface ResendCodeResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginResponse {
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
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

export interface CreateFeedPostRequest {
  origin: string;
  destination: string;
  price: number;
  seats: number;
  departureTime: string;
  vehicleInfo?: string;
  description?: string;
}

export interface FeedPostResponse {
  id: string;
  username: string;
  email: string;
  name: string | null;
  school: string | null;
  origin: string;
  destination: string;
  price: number;
  seats: number;
  departureTime: string;
  vehicleInfo: string | null;
  description: string | null;
  createdAt: string;
}

export interface CreatePostEnvelope {
  message: string;
  post: FeedPostResponse;
}

export interface DeletePostResponse {
  message: string;
}
