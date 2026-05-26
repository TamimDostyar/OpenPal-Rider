import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ApiError, api } from "@/api/client";
import type { FeedPostResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";
import { DateTimeField } from "@/components/DateTimeField";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "UpdatePost">;

function toStringValue(value: number | null | undefined, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function formatTitle(post: FeedPostResponse): string {
  return `${post.origin} → ${post.destination}`;
}

export function UpdatePostScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { token, signOut } = useAuth();
  const post = route.params.post;

  const [origin, setOrigin] = useState(post.origin ?? "");
  const [destination, setDestination] = useState(post.destination ?? "");
  const [postType, setPostType] = useState<"DRIVER" | "PASSENGER">(
    post.postType ?? "DRIVER",
  );
  const [price, setPrice] = useState(toStringValue(post.price));
  const [seats, setSeats] = useState(toStringValue(post.seats, "1"));
  const [departureTime, setDepartureTime] = useState(post.departureTime ?? "");
  const [vehicleInfo, setVehicleInfo] = useState(post.vehicleInfo ?? "");
  const [description, setDescription] = useState(post.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => formatTitle(post), [post]);

  const submit = async () => {
    if (!token) {
      setError("You're signed out — log in to update this post.");
      return;
    }
    if (!origin.trim()) return setError("Where are you leaving from?");
    if (!destination.trim()) return setError("Where are you going?");

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return setError("Enter a valid price (e.g. 25 or 25.50).");
    }
    const seatsNum = Number.parseInt(seats, 10);
    if (!Number.isFinite(seatsNum) || seatsNum < 1) {
      return setError("Seats must be at least 1.");
    }
    if (!departureTime) {
      return setError("Pick when the ride leaves.");
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.feed.create(token, {
        postType,
        origin: origin.trim(),
        destination: destination.trim(),
        price: priceNum,
        seats: seatsNum,
        departureTime,
        vehicleInfo: vehicleInfo.trim() || undefined,
        description: description.trim() || undefined,
      });

      try {
        await api.feed.delete(token, post.id);
      } catch {
        Alert.alert("Update saved", "Your updated post was created, but the old post could not be removed. You can delete it from your profile.");
      }

      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          await signOut();
          return;
        }
        setError(err.message);
      } else {
        setError("Couldn't update the post.");
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
        <View className="flex-1 items-center">
          <Text className="text-base font-semibold text-ink">Update ride</Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormError message={error} />

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Looking for
          </Text>
          <View className="flex-row rounded-full bg-cream-2 p-1">
            <Pressable
              onPress={() => setPostType("DRIVER")}
              className={`flex-1 items-center rounded-full py-2 ${
                postType === "DRIVER" ? "bg-driver" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  postType === "DRIVER" ? "text-white" : "text-muted"
                }`}
              >
                Passengers
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPostType("PASSENGER")}
              className={`flex-1 items-center rounded-full py-2 ${
                postType === "PASSENGER" ? "bg-passenger" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  postType === "PASSENGER" ? "text-white" : "text-muted"
                }`}
              >
                Ride
              </Text>
            </Pressable>
          </View>
        </View>

        <TextField
          label="From"
          value={origin}
          onChangeText={setOrigin}
          placeholder="MSP"
          autoCapitalize="words"
        />
        <TextField
          label="To"
          value={destination}
          onChangeText={setDestination}
          placeholder="Colorado"
          autoCapitalize="words"
        />

        <DateTimeField
          label="Departure"
          value={departureTime}
          onChange={setDepartureTime}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Price (USD)"
              value={price}
              onChangeText={setPrice}
              placeholder="25"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Seats"
              value={seats}
              onChangeText={setSeats}
              placeholder="3"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TextField
          label="Vehicle (optional)"
          value={vehicleInfo}
          onChangeText={setVehicleInfo}
          placeholder="Silver Toyota Camry"
        />

        <TextField
          label="Notes (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Leaving early, one stop for gas"
          multiline
        />

        <View className="pt-2">
          <Button label="Save update" onPress={submit} loading={submitting} />
        </View>
      </ScrollView>
    </Screen>
  );
}
