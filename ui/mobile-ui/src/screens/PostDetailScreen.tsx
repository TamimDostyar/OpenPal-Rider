/**
 * PostDetailScreen is the full-screen read view for a single feed post. It
 * expands everything the compact FeedPostCard truncates — full description,
 * vehicle, schedule, poster — and renders the origin → destination route on a
 * free OpenStreetMap-based map (see RouteMap).
 *
 * Actions (book / message / report / view profile / delete) are passed through
 * navigation params as the route's own callbacks so the screen stays a pure
 * presenter and the feed remains the single source of truth for mutations.
 */
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Screen } from "@/components/Screen";
import { RouteMap } from "@/components/RouteMap";
import { Spinner } from "@/components/Spinner";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "PostDetail">;

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(value: number): string {
  return `$${Number(value).toFixed(0)}`;
}

function countdownLabel(iso: string): string | null {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  if (diffMs <= 0) return "Departed";
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} ${days === 1 ? "day" : "days"} left`;
  if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  return `${Math.max(1, minutes)} ${minutes === 1 ? "min" : "mins"} left`;
}

const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

function formatRecurring(raw: string): string {
  return raw
    .split(/[,\s]+/)
    .map((d) => DAY_LABELS[d.trim().toUpperCase()] ?? d.trim())
    .filter(Boolean)
    .join(" · ");
}

export function PostDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { token, signOut } = useAuth();
  const { post, isOwner } = route.params;

  const [booking, setBooking] = useState(false);

  const postType = post.postType ?? "DRIVER";
  const isPassenger = postType === "PASSENGER";
  const soldOut = !isPassenger && post.seats <= 0;

  const accentText = isPassenger ? "text-passenger" : "text-driver";
  const accentBg = isPassenger ? "bg-passenger-bg" : "bg-driver-bg";
  const accentBorder = isPassenger ? "border-passenger-border" : "border-driver-border";
  const tagLabel = isPassenger ? "Looking for a ride" : "Offering a ride";

  const displayName = post.name ?? post.username;
  const initial = (displayName?.[0] ?? "?").toUpperCase();
  const countdown = countdownLabel(post.departureTime);

  const close = () => navigation.goBack();

  const onBlock = () => {
    Alert.alert(
      `Block @${post.username}?`,
      "You won't see their posts or receive messages from them, and they can't message you. We'll review their account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              await api.blocks.create(token, { username: post.username });
              Alert.alert("Blocked", `You won't see @${post.username} anymore.`, [
                { text: "OK", onPress: close },
              ]);
            } catch (err: unknown) {
              if (err instanceof ApiError) {
                if (err.status === 401 || err.status === 403) {
                  await signOut();
                  return;
                }
                Alert.alert("Couldn't block", err.message);
              } else {
                Alert.alert("Couldn't block", "Please try again.");
              }
            }
          },
        },
      ],
    );
  };

  // Booking is performed directly here (like ReportScreen) so we don't have to
  // pass a non-serializable callback through navigation params. The feed
  // refreshes on focus, so the booked post drops out when we return.
  const onBook = () => {
    if (!token || booking) return;
    const title = isPassenger ? "Offer this ride?" : "Book seat?";
    const body = isPassenger
      ? `Offer to drive @${post.username}, ${post.origin} → ${post.destination}.`
      : `Request 1 seat from @${post.username}, ${post.origin} → ${post.destination}.`;
    const confirmLabel = isPassenger ? "Offer" : "Book";

    Alert.alert(title, body, [
      { text: "Cancel", style: "cancel" },
      {
        text: confirmLabel,
        onPress: async () => {
          setBooking(true);
          try {
            await api.bookings.request(token, { postId: post.id, seatsRequested: 1 });
            Alert.alert(
              isPassenger ? "Offer sent" : "Requested",
              isPassenger
                ? "The rider was notified. Track this in Bookings."
                : "The driver was notified. Track this in Bookings.",
              [{ text: "OK", onPress: close }],
            );
          } catch (err: unknown) {
            if (err instanceof ApiError) {
              if (err.status === 401 || err.status === 403) {
                await signOut();
                return;
              }
              Alert.alert("Couldn't book", err.message);
            } else {
              Alert.alert("Couldn't book", "Please try again.");
            }
          } finally {
            setBooking(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen className="px-0">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable onPress={close} hitSlop={8} className="py-2">
          <Text className="text-sm font-semibold text-muted">Close</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">Ride details</Text>
        {isOwner ? (
          <Pressable
            onPress={() => navigation.navigate("UpdatePost", { post })}
            hitSlop={8}
            className="py-2"
          >
            <Text className="text-sm font-semibold text-ink">Edit</Text>
          </Pressable>
        ) : (
          <View className="w-12" />
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Type + countdown banner */}
        <View
          className={`flex-row items-center gap-2 rounded-2xl border px-4 py-3 ${accentBg} ${accentBorder}`}
        >
          <Text className={`text-xs font-semibold uppercase tracking-wider ${accentText}`}>
            {tagLabel}
          </Text>
          <View className="flex-1" />
          {countdown ? (
            <Text className={`text-xs font-bold ${accentText}`}>{countdown}</Text>
          ) : null}
        </View>

        {/* Route headline */}
        <View className="rounded-2xl border border-line bg-cream p-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-driver" />
            <Text className="flex-1 text-lg font-semibold text-ink">{post.origin}</Text>
          </View>
          <View className="my-1.5 ml-[4px] h-5 w-px bg-line-2" />
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-sm bg-coral" />
            <Text className="flex-1 text-lg font-semibold text-ink">{post.destination}</Text>
          </View>
        </View>

        {/* Map */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Route</Text>
          <RouteMap
            originLat={post.originLat}
            originLng={post.originLng}
            destLat={post.destLat}
            destLng={post.destLng}
            originLabel={post.origin}
            destLabel={post.destination}
            height={240}
          />
          <View className="flex-row items-center gap-4 px-1">
            <View className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full bg-driver" />
              <Text className="text-xs text-muted">Start</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-full bg-coral" />
              <Text className="text-xs text-muted">Destination</Text>
            </View>
          </View>
        </View>

        {/* Key facts grid */}
        <View className="flex-row flex-wrap gap-2">
          <View className="min-w-[46%] flex-1 rounded-2xl border border-line bg-cream p-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Departure
            </Text>
            <Text className="mt-1 text-sm font-semibold text-ink">
              {formatDeparture(post.departureTime)}
            </Text>
          </View>
          {!isPassenger ? (
            <View className="min-w-[46%] flex-1 rounded-2xl border border-line bg-cream p-4">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Price
              </Text>
              <Text className="mt-1 text-sm font-semibold text-ink">
                {formatPrice(post.price)}
              </Text>
            </View>
          ) : null}
          <View className="min-w-[46%] flex-1 rounded-2xl border border-line bg-cream p-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              {isPassenger ? "Riders" : "Seats"}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-ink">
              {post.seats} {isPassenger ? (post.seats === 1 ? "rider" : "riders") : post.seats === 1 ? "seat" : "seats"}
              {soldOut ? " · full" : ""}
            </Text>
          </View>
          {post.recurringDays ? (
            <View className="min-w-[46%] flex-1 rounded-2xl border border-line bg-cream p-4">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Repeats
              </Text>
              <Text className="mt-1 text-sm font-semibold text-ink">
                {formatRecurring(post.recurringDays)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {post.description ? (
          <View className="gap-1.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Notes
            </Text>
            <Text className="text-sm leading-6 text-ink-2">{post.description}</Text>
          </View>
        ) : null}

        {/* Vehicle */}
        {!isPassenger && post.vehicleInfo ? (
          <View className="gap-1.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Vehicle
            </Text>
            <Text className="text-sm text-ink-2">{post.vehicleInfo}</Text>
          </View>
        ) : null}

        {/* Poster */}
        <Pressable
          onPress={() => navigation.navigate("UserProfile", { username: post.username })}
          className="flex-row items-center gap-3 rounded-2xl border border-line bg-cream p-4"
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-cream-2">
            <Text className="text-base font-semibold text-ink">{initial}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                {displayName}
              </Text>
              {post.driverVerified ? (
                <Text className="text-[11px] font-semibold text-sage">Vehicle on file</Text>
              ) : null}
            </View>
            <Text className="text-xs text-muted" numberOfLines={1}>
              @{post.username}
              {post.school ? ` · ${post.school}` : ""}
            </Text>
          </View>
          <Text className="text-muted">›</Text>
        </Pressable>
      </ScrollView>

      {/* Sticky action bar */}
      {!isOwner ? (
        <View className="flex-row items-center gap-3 border-t border-line bg-cream px-5 py-3">
          <Pressable
            onPress={() => {
              navigation.navigate("Report", {
                kind: "post",
                postId: post.id,
                postSummary: `${post.origin} → ${post.destination}`,
              });
            }}
            hitSlop={8}
            className="px-2 py-2"
          >
            <Text className="text-sm text-muted">Report</Text>
          </Pressable>
          <Pressable onPress={onBlock} hitSlop={8} className="px-2 py-2">
            <Text className="text-sm text-muted">Block</Text>
          </Pressable>
          <View className="flex-1" />
          <Pressable
            onPress={() =>
              navigation.navigate("Conversation", {
                otherUsername: post.username,
                otherName: post.name ?? undefined,
              })
            }
            className="rounded-full border border-line px-5 py-3"
          >
            <Text className="text-sm font-semibold text-ink">Message</Text>
          </Pressable>
          {!soldOut ? (
            <Pressable
              onPress={onBook}
              disabled={booking}
              className="min-w-[88px] flex-row items-center justify-center rounded-full bg-ink px-6 py-3"
            >
              {booking ? (
                <Spinner tone="onInk" />
              ) : (
                <Text className="text-sm font-semibold text-cream">
                  {isPassenger ? "Offer ride" : "Book"}
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
