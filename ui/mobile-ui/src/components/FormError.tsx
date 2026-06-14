/**
 * Inline error banner shown above form fields. Renders nothing when the
 * message is null so callers can pass through unconditionally.
 */
import React from "react";
import { Text, View } from "react-native";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="rounded-2xl bg-rose/50 px-4 py-3">
      <Text className="text-sm text-coral-dk">{message}</Text>
    </View>
  );
}
