import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

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

  const email = decodeClaims(token)?.sub ?? null;

  const load = useCallback(async () => {
    if (!token) return;
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
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

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

        {ratings ? (
          <View className="gap-2 rounded-3xl border border-line bg-white p-5">
            <Text className="text-base font-semibold text-ink">Ratings</Text>
            <Text className="text-3xl font-semibold text-ink">
              {ratings.average.toFixed(1)}{" "}
              <Text className="text-base font-normal text-muted">
                · {ratings.count} review{ratings.count === 1 ? "" : "s"}
              </Text>
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
          </View>
        ) : null}

        <View className="gap-2 rounded-3xl border border-line bg-white p-5">
          <Text className="text-base font-semibold text-ink">My posted rides</Text>
          {myRides.length === 0 ? (
            <Text className="text-sm text-muted">No rides posted yet.</Text>
          ) : (
            myRides.slice(0, 5).map((r) => (
              <View key={r.id} className="border-t border-line pt-2">
                <Text className="text-sm font-semibold text-ink">
                  {r.origin} → {r.destination}
                </Text>
                <Text className="text-xs text-muted">
                  {new Date(r.departureTime).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {r.seats} seat{r.seats === 1 ? "" : "s"} left
                </Text>
              </View>
            ))
          )}
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
