import React from "react";
import { Pressable, Text, View } from "react-native";

import type { FeedPostResponse } from "@/api/types";

interface FeedPostCardProps {
  post: FeedPostResponse;
  isOwner: boolean;
  onDelete?: (id: string) => void;
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
  return `$${Number(value).toFixed(2)}`;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function FeedPostCard({ post, isOwner, onDelete }: FeedPostCardProps) {
  const displayName = post.name ?? post.username;
  const initial = (displayName?.[0] ?? "?").toUpperCase();

  return (
    <View className="gap-3 rounded-3xl border border-line bg-white p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-cream-2">
          <Text className="text-base font-semibold text-ink">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            @{post.username}
            {post.school ? ` · ${post.school}` : ""}
          </Text>
        </View>
        <Text className="text-xs text-muted">{relativeTime(post.createdAt)}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-xl font-semibold text-ink">{post.origin}</Text>
        <Text className="text-xl text-muted">→</Text>
        <Text className="text-xl font-semibold text-ink">{post.destination}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-ink-2">{formatDeparture(post.departureTime)}</Text>
        <View className="rounded-full bg-sage px-3 py-1">
          <Text className="text-sm font-semibold text-cream">{formatPrice(post.price)}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-sm text-ink-2">
          {post.seats} seat{post.seats === 1 ? "" : "s"}
        </Text>
        {post.vehicleInfo ? (
          <Text className="text-sm text-muted" numberOfLines={1}>
            · {post.vehicleInfo}
          </Text>
        ) : null}
      </View>

      {post.description ? (
        <Text className="text-sm leading-relaxed text-ink-2">{post.description}</Text>
      ) : null}

      {isOwner && onDelete ? (
        <Pressable onPress={() => onDelete(post.id)} className="self-end pt-1">
          <Text className="text-sm font-semibold text-coral-dk">Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
