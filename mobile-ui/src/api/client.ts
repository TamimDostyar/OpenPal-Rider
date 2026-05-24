/**
 * Thin fetch wrapper that talks to the OpenPal backend. Base URL comes from
 * EXPO_PUBLIC_API_URL (see .env). When unset, falls back to the Expo dev host
 * so a fresh checkout still works against a locally running Gradle backend.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

import type {
  CreateFeedPostRequest,
  CreatePostEnvelope,
  CreateUserRequest,
  CreateUserResponse,
  DeletePostResponse,
  FeedPostResponse,
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

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
  const port = 8080;
  if (devHost) return `http://${devHost}:${port}`;
  return Platform.OS === "android"
    ? `http://10.0.2.2:${port}`
    : `http://localhost:${port}`;
}

export const BASE_URL = resolveBaseUrl();
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

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
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

  feed: {
    list: (token: string) =>
      request<FeedPostResponse[]>("/api/feed/posts", { token }),

    listByUsername: (token: string, username: string) =>
      request<FeedPostResponse[]>(
        `/api/feed/posts/user/${encodeURIComponent(username)}`,
        { token },
      ),

    create: (token: string, payload: CreateFeedPostRequest) =>
      request<CreatePostEnvelope>("/api/feed/create-post", {
        method: "POST",
        token,
        body: payload,
      }),

    delete: (token: string, id: string) =>
      request<DeletePostResponse>(`/api/feed/posts/${encodeURIComponent(id)}`, {
        method: "DELETE",
        token,
      }),
  },
};
