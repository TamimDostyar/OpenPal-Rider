import Constants from "expo-constants";
import { Platform } from "react-native";

import type {
  CreateUserRequest,
  CreateUserResponse,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResendCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UniversitiesResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./types";

const BACKEND_PORT = 8080;
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
export const BASE_URL = devHost
  ? `http://${devHost}:${BACKEND_PORT}`
  : Platform.OS === "android"
    ? `http://10.0.2.2:${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ErrorPayload {
  error?: string;
}
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection.", 0);
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    const message = (data as ErrorPayload).error ?? "Something went wrong.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  health: () => request<{ Success: string }>("/api/"),

  createUser: (payload: CreateUserRequest) =>
    request<CreateUserResponse>("/api/user/create-user", {
      method: "POST",
      body: payload,
    }),

  verifyEmail: (payload: VerifyEmailRequest) =>
    request<VerifyEmailResponse>("/api/user/verify-email", {
      method: "POST",
      body: payload,
    }),

  resendCode: (email: string) =>
    request<ResendCodeResponse>("/api/user/resend-code", {
      method: "POST",
      body: { email },
    }),

  login: (payload: LoginRequest) =>
    request<LoginResponse>("/login-user", {
      method: "POST",
      body: payload,
    }),

  forgotPassword: (email: string) =>
    request<ForgotPasswordResponse>("/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (payload: ResetPasswordRequest) =>
    request<ResetPasswordResponse>("/reset-password", {
      method: "POST",
      body: payload,
    }),

  universities: () => request<UniversitiesResponse>("/api/universities"),
};
