import Constants from "expo-constants";
import { Platform } from "react-native";

import type {
  BookingEnvelope,
  BookingResponse,
  ConversationSummary,
  CreateBookingRequest,
  CreateFeedPostRequest,
  CreatePostEnvelope,
  CreateRatingEnvelope,
  CreateRatingRequest,
  CreateReportEnvelope,
  CreateReportRequest,
  CreateUserRequest,
  CreateUserResponse,
  DeletePostResponse,
  DirectMessageResponse,
  FeedPostResponse,
  FeedSearchParams,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  MyProfile,
  ResendCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendMessageEnvelope,
  SendMessageRequest,
  UniversitiesResponse,
  UserRatingsResponse,
  VehicleInfo,
  VehicleUpdateRequest,
  VehicleUpdateResponse,
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

type QueryValue = string | number | undefined | null;

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  query?: { [key: string]: QueryValue };
}

function buildPath(path: string, query?: RequestOptions["query"]): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${buildPath(path, options.query)}`, {
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

    search: (token: string, params: FeedSearchParams) =>
      request<FeedPostResponse[]>("/api/feed/search", {
        token,
        query: { ...params },
      }),

    listByUsername: (token: string, username: string) =>
      request<FeedPostResponse[]>(
        `/api/feed/posts/user/${encodeURIComponent(username)}`,
        { token },
      ),

    myRides: (token: string) =>
      request<FeedPostResponse[]>("/api/feed/my-rides", { token }),

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

  profile: {
    me: (token: string) =>
      request<MyProfile>("/api/profile/me", { token }),

    updateBio: (token: string, bio: string) =>
      request<MyProfile>("/api/profile/bio", {
        method: "PUT",
        token,
        body: { bio },
      }),
  },

  vehicle: {
    get: (token: string) =>
      request<VehicleInfo>("/api/profile/vehicle", { token }),

    update: (token: string, payload: VehicleUpdateRequest) =>
      request<VehicleUpdateResponse>("/api/profile/vehicle", {
        method: "PUT",
        token,
        body: payload,
      }),
  },

  bookings: {
    mine: (token: string) =>
      request<BookingResponse[]>("/api/bookings/mine", { token }),

    incoming: (token: string) =>
      request<BookingResponse[]>("/api/bookings/incoming", { token }),

    request: (token: string, payload: CreateBookingRequest) =>
      request<BookingEnvelope>("/api/bookings/request", {
        method: "POST",
        token,
        body: payload,
      }),

    accept: (token: string, id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/accept`, {
        method: "POST",
        token,
      }),

    decline: (token: string, id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/decline`, {
        method: "POST",
        token,
      }),

    cancel: (token: string, id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        token,
      }),

    complete: (token: string, id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/complete`, {
        method: "POST",
        token,
      }),
  },

  messages: {
    conversations: (token: string) =>
      request<ConversationSummary[]>("/api/messages/conversations", { token }),

    with: (token: string, username: string) =>
      request<DirectMessageResponse[]>(
        `/api/messages/with/${encodeURIComponent(username)}`,
        { token },
      ),

    send: (token: string, payload: SendMessageRequest) =>
      request<SendMessageEnvelope>("/api/messages/send", {
        method: "POST",
        token,
        body: payload,
      }),

    delete: (token: string, id: string) =>
      request<{ message: string }>(`/api/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        token,
      }),
  },

  ratings: {
    create: (token: string, payload: CreateRatingRequest) =>
      request<CreateRatingEnvelope>("/api/ratings", {
        method: "POST",
        token,
        body: payload,
      }),

    forUser: (token: string, username: string) =>
      request<UserRatingsResponse>(
        `/api/ratings/user/${encodeURIComponent(username)}`,
        { token },
      ),
  },

  reports: {
    create: (token: string, payload: CreateReportRequest) =>
      request<CreateReportEnvelope>("/api/reports", {
        method: "POST",
        token,
        body: payload,
      }),

    mine: (token: string) =>
      request<import("./types").ReportResponse[]>("/api/reports/mine", { token }),
  },
};
