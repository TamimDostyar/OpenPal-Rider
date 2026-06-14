/**
 * Shared screen shell that applies the white background, safe-area insets,
 * and keyboard-avoiding behavior used by every authenticated and auth screen.
 */
import React from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
}

export function Screen({ children, className }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className={`flex-1 px-6 ${className ?? ""}`}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
