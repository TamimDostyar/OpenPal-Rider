export interface MockPost {
  id: string;
  postType: 'DRIVER' | 'PASSENGER';
  origin: string;
  destination: string;
  departureTime: string;
  price?: number;
  seats: number;
  description?: string;
  vehicleInfo?: string;
  name: string;
  username: string;
  driverVerified?: boolean;
  createdAt: string;
}

export interface MockBooking {
  id: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
  postType: 'DRIVER' | 'PASSENGER';
  origin: string;
  destination: string;
  departureTime: string;
  otherName: string;
  otherUsername: string;
  seats: number;
}

export interface MockConversation {
  id: string;
  otherName: string;
  otherUsername: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MockProfile {
  name: string;
  username: string;
  email: string;
  school: string;
  graduationDate: string;
  bio: string;
  rating: number;
  reviewCount: number;
  ridesGiven: number;
  ridesTaken: number;
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    postType: 'DRIVER',
    origin: 'University of Washington',
    destination: 'Sea-Tac Airport',
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    price: 18,
    seats: 3,
    description: 'Leaving from Red Square. Can fit two medium suitcases in the trunk.',
    vehicleInfo: '2021 Honda Civic · Silver',
    name: 'Alex Chen',
    username: 'alexc0421',
    driverVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: '2',
    postType: 'PASSENGER',
    origin: 'Capitol Hill',
    destination: 'Bellevue Square',
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    seats: 1,
    description: 'Flexible on pickup spot within a few blocks. Happy to split gas.',
    name: 'Jordan Lee',
    username: 'jlee9812',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    postType: 'DRIVER',
    origin: 'North Campus',
    destination: 'Downtown Seattle',
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    price: 12,
    seats: 2,
    vehicleInfo: '2023 Toyota Corolla · Blue',
    name: 'Sam Rivera',
    username: 'samr2026',
    driverVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: 'b1',
    status: 'REQUESTED',
    postType: 'DRIVER',
    origin: 'UW Campus',
    destination: 'Pike Place Market',
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    otherName: 'Morgan Kim',
    otherUsername: 'mkim2025',
    seats: 1,
  },
  {
    id: 'b2',
    status: 'ACCEPTED',
    postType: 'PASSENGER',
    origin: 'Fremont',
    destination: 'UW Campus',
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
    otherName: 'Taylor Brooks',
    otherUsername: 'tbrooks',
    seats: 1,
  },
  {
    id: 'b3',
    status: 'COMPLETED',
    postType: 'DRIVER',
    origin: 'UW Campus',
    destination: 'Westlake Center',
    departureTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    otherName: 'Casey Nguyen',
    otherUsername: 'cnguyen',
    seats: 2,
  },
];

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'c1',
    otherName: 'Alex Chen',
    otherUsername: 'alexc0421',
    lastMessage: 'Sounds good — I can meet at Red Square at 2:45.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    unreadCount: 2,
  },
  {
    id: 'c2',
    otherName: 'Jordan Lee',
    otherUsername: 'jlee9812',
    lastMessage: 'Thanks for offering! What time works for you?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadCount: 0,
  },
];

export const MOCK_PROFILE: MockProfile = {
  name: 'Tamim Dostyar',
  username: 'tam051234',
  email: 'tamim@uw.edu',
  school: 'University of Washington',
  graduationDate: '2026-06-01',
  bio: 'CS senior. Usually driving to the airport on Fridays.',
  rating: 4.9,
  reviewCount: 12,
  ridesGiven: 8,
  ridesTaken: 14,
};
