/**
 * Reusable pill button with ink/coral/sage/ghost variants. Renders a spinner
 * when loading and dims itself while disabled.
 */
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "ink" | "coral" | "sage" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

const BACKGROUND: Record<Variant, string> = {
  ink: "bg-ink",
  coral: "bg-coral",
  sage: "bg-sage",
  ghost: "bg-transparent border border-line",
};

const TEXT: Record<Variant, string> = {
  ink: "text-cream",
  coral: "text-white",
  sage: "text-cream",
  ghost: "text-ink",
};

export function Button({
  label,
  onPress,
  variant = "ink",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const blocked = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      className={`h-14 flex-row items-center justify-center rounded-full ${BACKGROUND[variant]} ${
        blocked ? "opacity-40" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#120C0A" : "#F7F1EB"} />
      ) : (
        <Text className={`text-base font-semibold ${TEXT[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
