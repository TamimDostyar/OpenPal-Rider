import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { ApiError, api } from "@/api/client";
import type { FeedPostResponse, UserRatingsResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "UserProfile">;

function initialsFor(label: string): string {
  return (
    label
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function UserProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { username } = useRoute<Route>().params;
  const { token } = useAuth();

  const [posts, setPosts] = useState<FeedPostResponse[]>([]);
  const [ratings, setRatings] = useState<UserRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [postsR, ratingsR] = await Promise.allSettled([
        api.feed.listByUsername(token, username),
        api.ratings.forUser(token, username),
      ]);
      if (postsR.status === "fulfilled") setPosts(postsR.value);
      else if (postsR.reason instanceof ApiError) setError(postsR.reason.message);
      setRatings(ratingsR.status === "fulfilled" ? ratingsR.value : null);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Couldn't load this profile.");
    } finally {
      setLoading(false);
    }
  }, [token, username]);

  useEffect(() => {
    void load();
  }, [load]);

  // Use the most recent post to pull denormalized fields (name, school, verified).
  const primary = posts[0];
  const displayName = primary?.name ?? username;
  const school = primary?.school ?? null;
  const driverVerified = !!primary?.driverVerified;
  const ratingAvg = ratings && ratings.count > 0 ? ratings.average.toFixed(1) : "—";
  const ratingCount = ratings?.count ?? 0;

  return (
    <Screen className="px-0">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="py-2">
          <Text className="text-sm font-semibold text-ink">← Back</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            navigation.navigate("Conversation", { otherUsername: username })
          }
          className="rounded-full bg-ink px-4 py-1.5"
        >
          <Text className="text-xs font-semibold text-white">Message</Text>
        </Pressable>
      </View>

      {loading && posts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0A0A0A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 20 }}
        >
          {error ? <FormError message={error} /> : null}

          <View className="flex-row items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-cream-2">
              <Text className="text-2xl font-semibold text-ink">{initialsFor(displayName)}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
                  {displayName}
                </Text>
                {driverVerified ? (
                  <View className="rounded-full bg-sage px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-white">✓ verified</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs text-muted" numberOfLines={1}>
                @{username}
              </Text>
              {school ? (
                <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                  {school}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-center justify-between rounded-2xl border border-line bg-cream-2 px-4 py-3">
            <Stat label="Posts" value={String(posts.length)} />
            <View className="h-8 w-px bg-line" />
            <Stat label="Rating" value={ratingAvg} />
            <View className="h-8 w-px bg-line" />
            <Stat label="Reviews" value={String(ratingCount)} />
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate("Report", { kind: "user", username })
            }
            className="self-start"
            hitSlop={6}
          >
            <Text className="text-xs font-semibold text-coral">Report this user</Text>
          </Pressable>

          <View className="gap-2 border-t border-line pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Their posts
            </Text>
            {posts.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-sm text-muted">No posts yet.</Text>
              </View>
            ) : (
              posts.map((p) => <PostRow key={p.id} post={p} />)
            )}
          </View>

          {ratings && ratings.count > 0 ? (
            <View className="gap-2 border-t border-line pt-4">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Recent reviews
              </Text>
              {ratings.ratings.slice(0, 5).map((r) => (
                <View key={r.id} className="rounded-2xl border border-line bg-cream p-3">
                  <Text className="text-xs text-muted">
                    @{r.raterUsername} · {"★".repeat(r.stars)}
                  </Text>
                  {r.text ? <Text className="text-sm text-ink-2">{r.text}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-lg font-semibold text-ink">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{label}</Text>
    </View>
  );
}

function PostRow({ post }: { post: FeedPostResponse }) {
  const isPassenger = (post.postType ?? "DRIVER") === "PASSENGER";
  const dot = isPassenger ? "bg-passenger" : "bg-driver";
  const accent = isPassenger ? "text-passenger" : "text-driver";
  const tag = isPassenger ? "Looking" : "Offering";
  const when = new Date(post.departureTime).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <View className="rounded-2xl border border-line bg-cream p-3">
      <View className="mb-1 flex-row items-center gap-1.5">
        <View className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <Text className={`text-[10px] font-semibold uppercase tracking-wider ${accent}`}>
          {tag}
        </Text>
      </View>
      <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
        {post.origin} → {post.destination}
      </Text>
      <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
        {when}
        {!isPassenger
          ? ` · $${post.price.toFixed(0)} · ${post.seats} seat${post.seats === 1 ? "" : "s"}`
          : ""}
      </Text>
    </View>
  );
}
