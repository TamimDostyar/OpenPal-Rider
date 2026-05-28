import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "RateRide">;

export function RateRideScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { token, signOut } = useAuth();
  const { booking } = route.params;

  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherUsername =
    booking.riderUsername && booking.driverUsername
      ? // Caller could be either side — we don't know without comparing the JWT,
        // but on the booking row server returns both. The label just shows the counterparty
        // generically.
        booking.driverUsername
      : booking.driverUsername;

  const submit = async () => {
    if (!token) return;
    if (stars < 1 || stars > 5) {
      setError("Pick a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.ratings.create(token, {
        bookingId: booking.id,
        stars,
        text: text.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          await signOut();
          return;
        }
        setError(err.message);
      } else {
        setError("Couldn't submit the rating.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} className="py-2">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">Rate ride</Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormError message={error} />

        <View className="gap-2 rounded-3xl border border-line bg-cream p-4">
          <Text className="text-sm text-muted">Ride</Text>
          <Text className="text-base font-semibold text-ink">
            {booking.origin ?? "?"} → {booking.destination ?? "?"}
          </Text>
          <Text className="text-xs text-muted">
            With @{otherUsername}
          </Text>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Stars
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= stars;
              return (
                <Pressable
                  key={n}
                  onPress={() => setStars(n)}
                  className={`h-12 w-12 items-center justify-center rounded-full border ${
                    filled ? "border-coral bg-coral" : "border-line bg-cream"
                  }`}
                >
                  <Text
                    className={`text-xl ${filled ? "text-white" : "text-muted"}`}
                  >
                    ★
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Comment (optional)
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="On time, easy ride, would book again"
            placeholderTextColor="#6B7076"
            multiline
            className="min-h-24 rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink"
          />
        </View>

        <View className="pt-2">
          <Button label="Submit rating" onPress={submit} loading={submitting} />
        </View>
      </ScrollView>
    </Screen>
  );
}
