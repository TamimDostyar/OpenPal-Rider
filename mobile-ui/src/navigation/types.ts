import type { BookingResponse } from "@/api/types";

export type TabKey = "home" | "bookings" | "messages" | "profile";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { resetToken?: string };
  AuthedTabs: { initialTab?: TabKey } | undefined;
  CreatePost: undefined;
  Search: undefined;
  Conversation: { otherUsername: string; bookingId?: string };
  RateRide: { booking: BookingResponse };
  Report:
    | { kind: "post"; postId: string; postSummary?: string }
    | { kind: "user"; username: string };
  Vehicle: undefined;
};
