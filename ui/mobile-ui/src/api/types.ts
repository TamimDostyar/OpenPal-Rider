export interface CreateUserRequest {
  name: string;
  email: string;
  school: string;
  graduationDate: string;
  phoneNumber: number;
  password: string;
}

export interface HomeRouter{
  name: string;
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

// Campus endpoints that return a flat list of scraped items.
export type ScrapeCategory = "news" | "gym-hours" | "cafe-hours" | "library";
// What the "On campus today" strip shows. "dining" is a composite card backed by
// the café hours + today's grouped menu rather than a single scrape endpoint.
export type CampusCategory = "news" | "gym-hours" | "dining" | "library";

export interface ScrapeItem {
  text: string;
  link: string | null;
  image: string | null;
}

// Today's menu, grouped by meal period → station → dish (see /api/schools/{school}/menu).
export interface MenuDish {
  name: string;
  /** Price as published, e.g. "7.25"; blank when the item is free/unpriced. */
  price: string;
  /** Dietary/allergen labels, e.g. ["Vegan", "Wheat/Gluten"]. */
  dietary: string[];
}

export interface MenuStation {
  name: string;
  items: MenuDish[];
}

export interface MenuDaypart {
  label: string;
  /** 24h start/end as published by the café, e.g. "07:30"; may be blank. */
  start: string;
  end: string;
  stations: MenuStation[];
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
  postType?: "DRIVER" | "PASSENGER";
  origin: string;
  destination: string;
  price: number;
  seats: number;
  departureTime: string;
  vehicleInfo?: string;
  description?: string;
  originLat?: number;
  originLng?: number;
  originPlaceId?: string;
  destLat?: number;
  destLng?: number;
  destPlaceId?: string;
  recurringDays?: string;
}

export interface FeedPostResponse {
  id: string;
  postType?: "DRIVER" | "PASSENGER";
  username: string;
  email: string;
  name: string | null;
  school: string | null;
  driverVerified: boolean | null;
  origin: string;
  originLat: number | null;
  originLng: number | null;
  originPlaceId: string | null;
  destination: string;
  destLat: number | null;
  destLng: number | null;
  destPlaceId: string | null;
  price: number;
  seats: number;
  departureTime: string;
  vehicleInfo: string | null;
  description: string | null;
  recurringDays: string | null;
  createdAt: string;
}

export interface CreatePostEnvelope {
  message: string;
  post: FeedPostResponse;
}

export interface DeletePostResponse {
  message: string;
}

export interface FeedSearchParams {
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  maxPrice?: number;
  minSeats?: number;
}

export interface MyProfile {
  username: string;
  name: string | null;
  email: string;
  school: string | null;
  bio: string | null;
  driverVerified: boolean;
}

export interface VehicleInfo {
  licensePlate: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  driverVerified: boolean;
}

export interface VehicleUpdateRequest {
  licensePlate: string;
  make: string;
  model: string;
  color: string;
}

export interface VehicleUpdateResponse {
  message: string;
  driverVerified: boolean;
}

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED";

export interface BookingResponse {
  id: string;
  postId: string;
  riderUsername: string;
  riderEmail: string;
  driverUsername: string;
  driverEmail: string;
  seatsRequested: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  origin: string | null;
  destination: string | null;
  departureTime: string | null;
  postType: "DRIVER" | "PASSENGER" | null;
}

export interface BookingEnvelope {
  message: string;
  booking: BookingResponse;
}

export interface CreateBookingRequest {
  postId: string;
  seatsRequested: number;
}

export interface DirectMessageResponse {
  id: string;
  senderUsername: string;
  senderName: string | null;
  senderEmail: string;
  recipientUsername: string;
  recipientName: string | null;
  recipientEmail: string;
  bookingId: string | null;
  text: string;
  readAt: string | null;
  createdAt: string;
}

export interface SendMessageRequest {
  recipientUsername: string;
  text: string;
  bookingId?: string;
}

export interface SendMessageEnvelope {
  message: string;
  data: DirectMessageResponse;
}

export interface ConversationSummary {
  otherUsername: string;
  otherName: string | null;
  otherEmail: string;
  lastMessage: DirectMessageResponse;
  unreadCount: number;
}

export interface RatingResponse {
  id: string;
  bookingId: string;
  raterUsername: string;
  ratedUsername: string;
  stars: number;
  text: string | null;
  createdAt: string;
}

export interface CreateRatingRequest {
  bookingId: string;
  stars: number;
  text?: string;
}

export interface CreateRatingEnvelope {
  message: string;
  rating: RatingResponse;
}

export interface UserRatingsResponse {
  username: string;
  average: number;
  count: number;
  ratings: RatingResponse[];
}

export type ReportTargetType = "USER" | "POST";
export type ReportStatus = "OPEN" | "REVIEWED" | "DISMISSED" | "ACTIONED";

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetUsername?: string;
  targetPostId?: string;
  reason: string;
  text?: string;
}

export interface ReportResponse {
  id: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  text: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportEnvelope {
  message: string;
  report: ReportResponse;
}

export interface CreateBlockRequest {
  username: string;
  reason?: string;
}

export interface BlockResponse {
  id: string;
  blockedUsername: string;
  reason: string | null;
  createdAt: string;
}

export interface CreateBlockEnvelope {
  message: string;
  block?: BlockResponse;
}

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
  footer?: string;
}
