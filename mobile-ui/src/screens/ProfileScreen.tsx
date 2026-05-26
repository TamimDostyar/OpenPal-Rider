import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ApiError, api } from "@/api/client";
import type { FeedPostResponse, UserRatingsResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useVehicle } from "@/hooks/useVehicle";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BUG_REPORT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe3zd3k3IRQ-rh_Y12asBzfg4OK1nXxY_6eUa6CdP-KQ1fWxQ/viewform?usp=publish-editor";

function decodeClaims(token: string | null): { sub?: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = globalThis.atob ? globalThis.atob(padded) : "";
    return decoded ? (JSON.parse(decoded) as { sub?: string }) : null;
  } catch {
    return null;
  }
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { token, signOut } = useAuth();
  const { info: vehicle } = useVehicle();
  const [myRides, setMyRides] = useState<FeedPostResponse[]>([]);
  const [ratings, setRatings] = useState<UserRatingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const email = decodeClaims(token)?.sub ?? null;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rides = await api.feed.myRides(token);
      setMyRides(rides);
      if (rides[0]?.username) {
        try {
          const r = await api.ratings.forUser(token, rides[0].username);
          setRatings(r);
        } catch {
          // ignore — user might just have no ratings yet
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const primaryRide = myRides[0] ?? null;
  const username =
    primaryRide?.username ?? email?.split("@")[0] ?? "you";
  const displayName = primaryRide?.name ?? primaryRide?.username ?? "Your profile";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bio = primaryRide?.school
    ? `Student at ${primaryRide.school}`
    : "No bio yet.";

  const openBugReport = async () => {
    try {
      const supported = await Linking.canOpenURL(BUG_REPORT_URL);
      if (supported) {
        await Linking.openURL(BUG_REPORT_URL);
      } else {
        Alert.alert("Can't open link", BUG_REPORT_URL);
      }
    } catch {
      Alert.alert("Can't open link", BUG_REPORT_URL);
    }
  };

  return (
    <Screen className="px-0">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 16 }}
      >
        <View className="pt-2">
          <Text className="text-2xl font-semibold text-ink">Profile</Text>
          {email ? <Text className="text-xs text-muted">{email}</Text> : null}
        </View>

        {error ? <FormError message={error} /> : null}

        <View className="gap-4 rounded-3xl border border-line bg-white p-5">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-cream-2">
              <Text className="text-xl font-semibold text-ink">
                {initials || "?"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="text-xs text-muted">@{username}</Text>
              <Text className="text-xs text-ink-2" numberOfLines={2}>
                {bio}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between rounded-2xl bg-cream-2 px-4 py-3">
            <View className="items-center">
              <Text className="text-base font-semibold text-ink">{myRides.length}</Text>
              <Text className="text-[10px] uppercase tracking-wider text-muted">
                Posts
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-base font-semibold text-ink">
                {ratings ? ratings.average.toFixed(1) : "--"}
              </Text>
              <Text className="text-[10px] uppercase tracking-wider text-muted">
                Rating
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-base font-semibold text-ink">
                {ratings ? ratings.count : 0}
              </Text>
              <Text className="text-[10px] uppercase tracking-wider text-muted">
                Reviews
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-2 rounded-3xl border border-line bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-ink">Ratings</Text>
            {ratings ? (
              <Text className="text-xs text-muted">
                {ratings.count} review{ratings.count === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
          {ratings ? (
            <>
              <Text className="text-3xl font-semibold text-ink">
                {ratings.average.toFixed(1)}
              </Text>
              {ratings.ratings.slice(0, 3).map((r) => (
                <View key={r.id} className="border-t border-line pt-2">
                  <Text className="text-xs text-muted">
                    @{r.raterUsername} · {"★".repeat(r.stars)}
                  </Text>
                  {r.text ? (
                    <Text className="text-sm text-ink-2">{r.text}</Text>
                  ) : null}
                </View>
              ))}
            </>
          ) : (
            <Text className="text-sm text-muted">No ratings yet.</Text>
          )}
        </View>

        <View className="gap-3 rounded-3xl border border-line bg-white p-5">
          <Text className="text-base font-semibold text-ink">My posts</Text>
          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#120C0A" />
            </View>
          ) : myRides.length === 0 ? (
            <Text className="text-sm text-muted">No rides posted yet.</Text>
          ) : (
            myRides.map((r) => {
              const postType = r.postType ?? "DRIVER";
              const isPassenger = postType === "PASSENGER";
              const cardTone = isPassenger
                ? "border-passenger-border bg-passenger-bg"
                : "border-driver-border bg-driver-bg";
              const badgeTone = isPassenger ? "bg-passenger" : "bg-driver";
              const badgeLabel = isPassenger
                ? "Looking for rides"
                : "Looking for passengers";
              return (
                <View key={r.id} className={`gap-2 rounded-2xl border p-4 ${cardTone}`}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink">
                      {r.origin} → {r.destination}
                    </Text>
                    <Text className="text-xs text-muted">
                      {new Date(r.departureTime).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate("UpdatePost", { post: r })}
                    className="rounded-full border border-line bg-white px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-ink">Update</Text>
                  </Pressable>
                </View>
                <View className={`self-start rounded-full px-2.5 py-1 ${badgeTone}`}>
                  <Text className="text-[10px] font-semibold text-white">
                    {badgeLabel}
                  </Text>
                </View>
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="text-xs text-ink-2">
                    {r.seats} seat{r.seats === 1 ? "" : "s"}
                  </Text>
                  <Text className="text-xs text-muted">·</Text>
                  <Text className="text-xs text-ink-2">${r.price.toFixed(2)}</Text>
                  {r.vehicleInfo ? (
                    <>
                      <Text className="text-xs text-muted">·</Text>
                      <Text className="text-xs text-muted" numberOfLines={1}>
                        {r.vehicleInfo}
                      </Text>
                    </>
                  ) : null}
                </View>
                </View>
              );
            })
          )}
        </View>

        <View className="gap-3 rounded-3xl border border-line bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-ink">Driver</Text>
            {vehicle?.driverVerified ? (
              <View className="rounded-full bg-sage px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-cream">✓ verified</Text>
              </View>
            ) : (
              <Text className="text-xs text-muted">Not verified</Text>
            )}
          </View>
          {vehicle?.make ? (
            <Text className="text-sm text-ink-2">
              {vehicle.color} {vehicle.make} {vehicle.model} · {vehicle.licensePlate}
            </Text>
          ) : (
            <Text className="text-sm text-muted">
              Add your vehicle to post rides and earn the verified badge.
            </Text>
          )}
          <Pressable
            onPress={() => navigation.navigate("Vehicle")}
            className="self-start rounded-full bg-ink px-4 py-2"
          >
            <Text className="text-sm font-semibold text-cream">
              {vehicle?.make ? "Edit vehicle" : "Add vehicle"}
            </Text>
          </Pressable>
        </View>

        <View className="gap-2 rounded-3xl border border-line bg-white p-5">
          <Text className="text-base font-semibold text-ink">Support</Text>
          <Pressable onPress={openBugReport} className="py-2">
            <Text className="text-sm font-semibold text-ink-2">
              Report an issue / bug →
            </Text>
            <Text className="text-xs text-muted">Opens a Google Form in your browser.</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={signOut}
          className="self-stretch rounded-full border border-line bg-white py-3"
        >
          <Text className="text-center text-sm font-semibold text-coral-dk">
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
