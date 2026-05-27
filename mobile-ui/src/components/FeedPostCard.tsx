import React from "react";
import { Pressable, Text, View } from "react-native";

import type { FeedPostResponse } from "@/api/types";

interface FeedPostCardProps {
  post: FeedPostResponse;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onBook?: (post: FeedPostResponse) => void;
  onReport?: (post: FeedPostResponse) => void;
  onMessage?: (post: FeedPostResponse) => void;
  onViewProfile?: (post: FeedPostResponse) => void;
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

export function FeedPostCard({
  post,
  isOwner,
  onDelete,
  onBook,
  onReport,
  onMessage,
  onViewProfile,
}: FeedPostCardProps) {
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
      {/* Status strip */}
      <View className="mb-3 flex-row items-center gap-2">
        <View className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
        <Text className={`text-[11px] font-semibold uppercase tracking-wider ${accentText}`}>
          {tagLabel}
        </Text>
        <View className="flex-1" />
        <Text className="text-[11px] text-muted">{relativeTime(post.createdAt)}</Text>
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
              <Text className="text-[13px] font-semibold text-ink" numberOfLines={1}>
                {displayName}
              </Text>
              {post.driverVerified ? (
                <Text className="text-[10px] font-semibold text-sage">✓</Text>
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
            {onReport ? (
              <Pressable onPress={() => onReport(post)} hitSlop={8} className="px-2 py-1">
                <Text className="text-xs text-muted">Report</Text>
              </Pressable>
            ) : null}
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
                <Text className="text-xs font-semibold text-white">
                  {isPassenger ? "Offer ride" : "Book"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
