import { session } from '@/auth/session';
import type {
  AnnouncementItem,
  BlockResponse,
  BookingEnvelope,
  BookingResponse,
  ConversationSummary,
  CreateBlockEnvelope,
  CreateBlockRequest,
  CreateBookingRequest,
  CreateFeedPostRequest,
  CreatePostEnvelope,
  CreateRatingEnvelope,
  CreateRatingRequest,
  CreateReportEnvelope,
  CreateReportRequest,
  CreateUserRequest,
  CreateUserResponse,
  DirectMessageResponse,
  FeedPostResponse,
  FeedSearchParams,
  ForgotPasswordResponse,
  LegalDocument,
  LoginRequest,
  LoginResponse,
  MenuDaypart,
  MyProfile,
  ReportResponse,
  ResendCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ScrapeCategory,
  ScrapeItem,
  SendMessageEnvelope,
  SendMessageRequest,
  UniversitiesResponse,
  UserRatingsResponse,
  VehicleInfo,
  VehicleUpdateRequest,
  VehicleUpdateResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from './types';

export const BASE_URL: string = (import.meta.env?.VITE_BASE_URL || 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueryValue = string | number | undefined | null;

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, QueryValue>;
}

function buildPath(path: string, query?: RequestOptions['query']): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth) {
    const token = session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${buildPath(path, options.query)}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }

  const text = await response.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const message = (data as { error?: string }).error ?? 'Something went wrong.';
    // The backend rejected the stored token (expired/invalid/revoked) — clear
    // it and let the app return to /login instead of leaving the user stuck
    // on a screen that can never load.
    if (options.auth && (response.status === 401 || response.status === 403)) {
      session.expire();
    }
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  health: () => request<{ Success: string }>('/api/'),

  announcements: () =>
    request<{ success: AnnouncementItem[] }>('/api/announcements/read-news'),

  createUser: (payload: CreateUserRequest) =>
    request<CreateUserResponse>('/api/user/create-user', { method: 'POST', body: payload }),

  verifyEmail: (payload: VerifyEmailRequest) =>
    request<VerifyEmailResponse>('/api/user/verify-email', { method: 'POST', body: payload }),

  resendCode: (email: string) =>
    request<ResendCodeResponse>('/api/user/resend-code', { method: 'POST', body: { email } }),

  login: (payload: LoginRequest) =>
    request<LoginResponse>('/login-user', { method: 'POST', body: payload }),

  forgotPassword: (email: string) =>
    request<ForgotPasswordResponse>('/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (payload: ResetPasswordRequest) =>
    request<ResetPasswordResponse>('/reset-password', { method: 'POST', body: payload }),

  universities: () => request<UniversitiesResponse>('/api/universities'),

  legal: {
    terms: () => request<LegalDocument>('/api/legal/terms'),
    privacy: () => request<LegalDocument>('/api/legal/privacy'),
  },

  feed: {
    list: () => request<FeedPostResponse[]>('/api/feed/posts', { auth: true }),

    search: (params: FeedSearchParams) =>
      request<FeedPostResponse[]>('/api/feed/search', { auth: true, query: { ...params } }),

    listByUsername: (username: string) =>
      request<FeedPostResponse[]>(`/api/feed/posts/user/${encodeURIComponent(username)}`, {
        auth: true,
      }),

    myRides: () => request<FeedPostResponse[]>('/api/feed/my-rides', { auth: true }),

    create: (payload: CreateFeedPostRequest) =>
      request<CreatePostEnvelope>('/api/feed/create-post', {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/api/feed/posts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
      }),
  },

  profile: {
    me: () => request<MyProfile>('/api/profile/me', { auth: true }),

    updateBio: (bio: string) =>
      request<MyProfile>('/api/profile/bio', { method: 'PUT', auth: true, body: { bio } }),

    deleteAccount: () =>
      request<{ message: string }>('/api/profile/account', { method: 'DELETE', auth: true }),
  },

  vehicle: {
    get: () => request<VehicleInfo>('/api/profile/vehicle', { auth: true }),

    update: (payload: VehicleUpdateRequest) =>
      request<VehicleUpdateResponse>('/api/profile/vehicle', {
        method: 'PUT',
        auth: true,
        body: payload,
      }),
  },

  bookings: {
    mine: () => request<BookingResponse[]>('/api/bookings/mine', { auth: true }),

    incoming: () => request<BookingResponse[]>('/api/bookings/incoming', { auth: true }),

    request: (payload: CreateBookingRequest) =>
      request<BookingEnvelope>('/api/bookings/request', {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    accept: (id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        auth: true,
      }),

    decline: (id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/decline`, {
        method: 'POST',
        auth: true,
      }),

    cancel: (id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        auth: true,
      }),

    complete: (id: string) =>
      request<BookingEnvelope>(`/api/bookings/${encodeURIComponent(id)}/complete`, {
        method: 'POST',
        auth: true,
      }),
  },

  messages: {
    conversations: () =>
      request<ConversationSummary[]>('/api/messages/conversations', { auth: true }),

    with: (username: string) =>
      request<DirectMessageResponse[]>(`/api/messages/with/${encodeURIComponent(username)}`, {
        auth: true,
      }),

    send: (payload: SendMessageRequest) =>
      request<SendMessageEnvelope>('/api/messages/send', {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/api/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
      }),
  },

  ratings: {
    create: (payload: CreateRatingRequest) =>
      request<CreateRatingEnvelope>('/api/ratings', { method: 'POST', auth: true, body: payload }),

    forUser: (username: string) =>
      request<UserRatingsResponse>(`/api/ratings/user/${encodeURIComponent(username)}`, {
        auth: true,
      }),
  },

  reports: {
    create: (payload: CreateReportRequest) =>
      request<CreateReportEnvelope>('/api/reports', { method: 'POST', auth: true, body: payload }),

    mine: () => request<ReportResponse[]>('/api/reports/mine', { auth: true }),
  },

  blocks: {
    create: (payload: CreateBlockRequest) =>
      request<CreateBlockEnvelope>('/api/blocks', { method: 'POST', auth: true, body: payload }),

    remove: (username: string) =>
      request<{ message: string }>(`/api/blocks/${encodeURIComponent(username)}`, {
        method: 'DELETE',
        auth: true,
      }),

    mine: () => request<BlockResponse[]>('/api/blocks', { auth: true }),
  },

  schools: {
    byCategory: (school: string, category: ScrapeCategory) =>
      request<ScrapeItem[]>(`/api/schools/${encodeURIComponent(school)}/${category}`),
    menu: (school: string) =>
      request<MenuDaypart[]>(`/api/schools/${encodeURIComponent(school)}/menu`),
  },
};
