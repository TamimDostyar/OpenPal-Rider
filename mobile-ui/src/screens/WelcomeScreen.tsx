/**
 * Landing screen shown to signed-out users. Pitches the product and routes
 * them into the signup or login flow.
 */
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { useWelcome } from "@/hooks/useWelcome";

export function WelcomeScreen() {
  const { goToSignup, goToLogin } = useWelcome();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-between">
        <View className="m-3 flex-1 justify-between rounded-3xl bg-sage p-7">
          <Logo tone="cream" />
          <View>
            <Text className="mb-4 text-xs uppercase tracking-widest text-cream/60">
              ·001 · students only
            </Text>
            <Text className="mb-4 text-5xl font-semibold leading-tight text-cream">
              Rides between classmates, not strangers.
            </Text>
            <Text className="text-base leading-relaxed text-cream/80">
              A campus-only carpool community. Verified .edu, real names, real
              reviews.
            </Text>
          </View>
        </View>

        <View className="gap-3 px-6 pb-4">
          <Button label="Create an account" variant="coral" onPress={goToSignup} />
          <Pressable onPress={goToLogin} className="py-2">
            <Text className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Text className="font-semibold text-ink">Log in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
