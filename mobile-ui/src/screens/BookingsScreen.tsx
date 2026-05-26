import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import type { BookingResponse, BookingStatus } from "@/api/types";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useBookings, type BookingScope } from "@/hooks/useBookings";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const STATUS_COLOR: Record<BookingStatus, string> = {
  REQUESTED: "bg-sun",
  ACCEPTED: "bg-sage",
  DECLINED: "bg-line",
  CANCELLED: "bg-line",
  COMPLETED: "bg-sky",
};

function formatDeparture(iso: string | null): string {
  if (!iso) return "";
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

export function BookingsScreen() {
  const navigation = useNavigation<Nav>();
  const {
    scope,
    setScope,
    bookings,
    loading,
    refreshing,
    error,
    refresh,
    accept,
    decline,
    cancel,
    complete,
  } = useBookings();

  const renderActions = (b: BookingResponse) => {
    const buttons: { label: string; tone: "ink" | "coral" | "ghost"; onPress: () => void }[] = [];
    if (scope === "incoming") {
      if (b.status === "REQUESTED") {
        buttons.push({ label: "Accept", tone: "ink", onPress: () => accept(b.id) });
        buttons.push({ label: "Decline", tone: "ghost", onPress: () => decline(b.id) });
      }
      if (b.status === "ACCEPTED") {
        buttons.push({ label: "Mark complete", tone: "ink", onPress: () => complete(b.id) });
        buttons.push({ label: "Cancel", tone: "ghost", onPress: () => cancel(b.id) });
      }
    } else {
      if (b.status === "REQUESTED" || b.status === "ACCEPTED") {
        buttons.push({ label: "Cancel", tone: "ghost", onPress: () => cancel(b.id) });
      }
      if (b.status === "COMPLETED") {
        buttons.push({
          label: "Rate ride",
          tone: "coral",
          onPress: () => navigation.navigate("RateRide", { booking: b }),
        });
      }
    }
    const otherUsername = scope === "incoming" ? b.riderUsername : b.driverUsername;
    buttons.push({
      label: "Message",
      tone: "ghost",
      onPress: () =>
        navigation.navigate("Conversation", {
          otherUsername,
          bookingId: b.id,
        }),
    });
    return buttons;
  };

  return (
    <Screen className="px-0">
      <View className="px-6 pb-3 pt-2">
        <Text className="text-2xl font-semibold text-ink">Bookings</Text>
      </View>

      <View className="mx-6 mb-3 flex-row rounded-full bg-cream-2 p-1">
        {(["mine", "incoming"] as BookingScope[]).map((opt) => {
          const isActive = opt === scope;
          return (
            <Pressable
              key={opt}
              onPress={() => setScope(opt)}
              className={`flex-1 items-center rounded-full py-2 ${
                isActive ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                {opt === "mine" ? "My requests" : "Incoming"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="px-6 pb-2">
          <FormError message={error} />
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0A0A0A" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <View className="gap-3 rounded-3xl border border-line bg-white p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-ink">
                  {item.origin ?? "?"} → {item.destination ?? "?"}
                </Text>
                <View className={`rounded-full ${STATUS_COLOR[item.status]} px-2.5 py-0.5`}>
                  <Text className="text-[10px] font-semibold text-ink">
                    {STATUS_LABEL[item.status]}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-ink-2">
                {scope === "incoming"
                  ? `@${item.riderUsername} requested ${item.seatsRequested} seat(s)`
                  : `Driver: @${item.driverUsername} · ${item.seatsRequested} seat(s)`}
              </Text>
              {item.departureTime ? (
                <Text className="text-xs text-muted">
                  {formatDeparture(item.departureTime)}
                </Text>
              ) : null}
              <View className="flex-row flex-wrap justify-end gap-2 pt-1">
                {renderActions(item).map((btn) => (
                  <Pressable
                    key={btn.label}
                    onPress={btn.onPress}
                    className={`rounded-full px-4 py-2 ${
                      btn.tone === "ink"
                        ? "bg-ink"
                        : btn.tone === "coral"
                          ? "bg-coral"
                          : "border border-line bg-white"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        btn.tone === "ghost" ? "text-ink" : "text-white"
                      }`}
                    >
                      {btn.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#0A0A0A" />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-12">
              <Text className="text-base font-semibold text-ink">
                {scope === "mine" ? "No bookings yet." : "No incoming requests."}
              </Text>
              <Text className="text-center text-sm text-muted">
                {scope === "mine"
                  ? "Book a ride from the feed."
                  : "Riders will request seats on your posted rides."}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
