import type { BookingResponse, FeedPostResponse } from "@/api/types";

export type TabKey = "home" | "bookings" | "messages" | "profile";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { resetToken?: string };
  AuthedTabs: { initialTab?: TabKey } | undefined;
  Permissions: undefined;
  CreatePost: undefined;
  UpdatePost: { post: FeedPostResponse };
  Search: undefined;
  Conversation: { otherUsername: string; bookingId?: string };
  RateRide: { booking: BookingResponse };
  Report:
    | { kind: "post"; postId: string; postSummary?: string }
    | { kind: "user"; username: string };
  Vehicle: undefined;
  UserProfile: { username: string };
};
