import React from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { Screen } from "@/components/Screen";
import { useHome } from "@/hooks/useHome";

const STATUS_TEXT = {
  checking: "Checking server…",
  online: "Server online",
  offline: "Server unreachable",
} as const;

export function HomeScreen() {
  const { status, signOut } = useHome();

  return (
    <Screen className="justify-between">
      <View className="gap-6 pt-6">
        <Logo />
        <Text className="text-4xl font-semibold leading-tight text-ink">
          You're signed in.
        </Text>
        <Text className="text-base leading-relaxed text-ink-2">
          Ride features arrive once the backend exposes trip endpoints. For now
          your account is verified and your session is active.
        </Text>

        <View className="flex-row items-center gap-2 rounded-2xl bg-cream-2 px-4 py-3">
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              status === "online"
                ? "bg-sage"
                : status === "offline"
                  ? "bg-coral"
                  : "bg-muted"
            }`}
          />
          <Text className="text-sm text-ink-2">{STATUS_TEXT[status]}</Text>
        </View>
      </View>

      <View className="pb-4">
        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}
