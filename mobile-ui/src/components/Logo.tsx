import React from "react";
import { Text, View } from "react-native";

interface LogoProps {
  tone?: "ink" | "cream";
}

export function Logo({ tone = "ink" }: LogoProps) {
  const textColor = tone === "cream" ? "text-cream" : "text-ink";
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-7 w-11">
        <View className="absolute left-0 top-0 h-7 w-7 rounded-full bg-coral" />
        <View className="absolute left-4 top-0 h-7 w-7 rounded-full bg-ink/80" />
      </View>
      <Text className={`text-2xl font-semibold ${textColor}`}>buddyride</Text>
    </View>
  );
}
