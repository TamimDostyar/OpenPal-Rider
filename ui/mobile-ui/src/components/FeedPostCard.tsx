import React from "react";
import { Pressable, Text, View } from "react-native";

import type { FeedPostResponse } from "@/api/types";

interface FeedPostCardProps {
  post: FeedPostResponse;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onBook?: (post: FeedPostResponse) => void;
  /** Opens the overflow menu (report / block). Triggered by the ⋯ button or a long-press. */
  onMore?: (post: FeedPostResponse) => void;
  onMessage?: (post: FeedPostResponse) => void;
  onViewProfile?: (post: FeedPostResponse) => void;
  /** Tap the card body to open the full ride detail screen. */
  onOpen?: (post: FeedPostResponse) => void;
}

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(value: number): string {
  return `$${Number(value).toFixed(0)}`;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

interface Countdown {
  value: number;
  unit: string;
  label: string;
  past: boolean;
}

function countdownTo(iso: string): Countdown | null {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();

  if (diffMs <= 0) {
    return { value: 0, unit: "", label: "departed", past: true };
  }

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) {
    return { value: days, unit: "d", label: days === 1 ? "day left" : "days left", past: false };
  }
  if (hours >= 1) {
    return { value: hours, unit: "h", label: hours === 1 ? "hour left" : "hours left", past: false };
  }
  return {
    value: Math.max(1, minutes),
    unit: "m",
    label: minutes === 1 ? "min left" : "mins left",
    past: false,
  };
}

function CountdownCircle({ iso, accent }: { iso: string; accent: boolean }) {
  const countdown = countdownTo(iso);
  if (!countdown) return null;

  const ring = countdown.past
    ? "border-line-2"
    : accent
      ? "border-passenger"
      : "border-driver";
  const valueColor = countdown.past
    ? "text-muted"
    : accent
      ? "text-passenger"
      : "text-driver";

  return (
    <View className="items-center">
      <View className={`h-12 w-12 items-center justify-center rounded-full border-2 ${ring}`}>
        {countdown.past ? (
          <Text className="text-[9px] font-semibold uppercase text-muted">past</Text>
        ) : (
          <Text className={`text-base font-bold ${valueColor}`}>
            {countdown.value}
            <Text className="text-[10px] font-semibold">{countdown.unit}</Text>
          </Text>
        )}
      </View>
      <Text className="mt-1 text-[10px] font-medium text-muted">{countdown.label}</Text>
    </View>
  );
}

export function FeedPostCard({
  post,
  isOwner,
  onDelete,
  onBook,
  onMore,
  onMessage,
  onViewProfile,
  onOpen,
}: FeedPostCardProps) {
  const moreEnabled = !isOwner && !!onMore;
  const displayName = post.name ?? post.username;
  const initial = (displayName?.[0] ?? "?").toUpperCase();
  const postType = post.postType ?? "DRIVER";
  const isPassenger = postType === "PASSENGER";
  const soldOut = !isPassenger && post.seats <= 0;

  const accentText = isPassenger ? "text-passenger" : "text-driver";
  const accentDot = isPassenger ? "bg-passenger" : "bg-driver";
  const tagLabel = isPassenger ? "Looking for a ride" : "Offering a ride";

  return (
    <View className="rounded-2xl border border-line bg-cream p-4">
      <Pressable
        onPress={onOpen ? () => onOpen(post) : undefined}
        onLongPress={moreEnabled ? () => onMore!(post) : undefined}
        delayLongPress={300}
        disabled={!onOpen && !moreEnabled}
        accessibilityRole={onOpen ? "button" : undefined}
        accessibilityHint={
          onOpen
            ? moreEnabled
              ? "Opens full ride details. Long-press for more options."
              : "Opens full ride details"
            : undefined
        }
      >
      {/* Status strip */}
      <View className="mb-3 flex-row items-start gap-2">
        <View className="flex-1 flex-row items-center gap-2">
          <View className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
          <Text className={`text-[11px] font-semibold uppercase tracking-wider ${accentText}`}>
            {tagLabel}
          </Text>
          <View className="flex-1" />
          <Text className="text-[11px] text-muted">{relativeTime(post.createdAt)}</Text>
        </View>
        <CountdownCircle iso={post.departureTime} accent={isPassenger} />
      </View>

      {/* Route — the headline */}
      <View className="mb-3">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-ink" />
          <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
            {post.origin}
          </Text>
        </View>
        <View className="my-1 ml-[3px] h-3 w-px bg-line-2" />
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-sm bg-ink" />
          <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
            {post.destination}
          </Text>
        </View>
      </View>

      {/* Meta row: departure + price/seats */}
      <View className="mb-3 flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <Text className="text-[13px] text-ink-2">{formatDeparture(post.departureTime)}</Text>
        {!isPassenger ? (
          <>
            <View className="h-1 w-1 rounded-full bg-line-2" />
            <Text className="text-[13px] font-semibold text-ink">
              {formatPrice(post.price)}
            </Text>
            <View className="h-1 w-1 rounded-full bg-line-2" />
            <Text className="text-[13px] text-ink-2">
              {post.seats} seat{post.seats === 1 ? "" : "s"}
              {soldOut ? " · full" : ""}
            </Text>
          </>
        ) : (
          <>
            <View className="h-1 w-1 rounded-full bg-line-2" />
            <Text className="text-[13px] text-ink-2">
              {post.seats} rider{post.seats === 1 ? "" : "s"}
            </Text>
          </>
        )}
      </View>

      {/* Description */}
      {post.description ? (
        <Text className="mb-3 text-[13px] leading-5 text-ink-2" numberOfLines={3}>
          {post.description}
        </Text>
      ) : null}

      {/* Vehicle hint for drivers */}
      {!isPassenger && post.vehicleInfo ? (
        <Text className="mb-3 text-xs text-muted" numberOfLines={1}>
          {post.vehicleInfo}
        </Text>
      ) : null}
      </Pressable>

      {/* Footer: poster + actions */}
      <View className="flex-row items-center gap-3 border-t border-line-2 pt-3">
        <Pressable
          onPress={onViewProfile ? () => onViewProfile(post) : undefined}
          disabled={!onViewProfile}
          hitSlop={6}
          className="flex-1 flex-row items-center gap-3"
        >
          <View className="h-8 w-8 items-center justify-center rounded-full bg-cream-2">
            <Text className="text-xs font-semibold text-ink">{initial}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="shrink text-[13px] font-semibold text-ink" numberOfLines={1}>
                {displayName}
              </Text>
              {post.driverVerified ? (
                <Text className="shrink-0 text-[10px] font-semibold text-sage">
                  Vehicle on file
                </Text>
              ) : null}
            </View>
            <Text className="text-[11px] text-muted" numberOfLines={1}>
              @{post.username}
              {onViewProfile ? "  ›" : ""}
            </Text>
          </View>
        </Pressable>

        {isOwner && onDelete ? (
          <Pressable onPress={() => onDelete(post.id)} hitSlop={8} className="px-2 py-1">
            <Text className="text-xs font-semibold text-coral">Delete</Text>
          </Pressable>
        ) : (
          <>
            {onMessage ? (
              <Pressable
                onPress={() => onMessage(post)}
                hitSlop={8}
                className="rounded-full border border-line px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-ink">Message</Text>
              </Pressable>
            ) : null}
            {onBook && !soldOut ? (
              <Pressable
                onPress={() => onBook(post)}
                className="rounded-full bg-ink px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-cream">
                  {isPassenger ? "Offer ride" : "Book"}
                </Text>
              </Pressable>
            ) : null}
            {moreEnabled ? (
              <Pressable
                onPress={() => onMore!(post)}
                hitSlop={8}
                accessibilityLabel="More options"
                accessibilityHint="Report or block this person"
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <Text className="text-base leading-none text-muted">⋯</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
