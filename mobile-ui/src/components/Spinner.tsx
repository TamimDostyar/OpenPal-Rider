/**
 * Theme-aware loading spinner. ActivityIndicator's color is a prop (not a
 * className), so it can't pick up the ink token automatically — this wrapper
 * resolves the right ink color for the current color scheme.
 */
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator } from "react-native";

interface SpinnerProps {
  size?: "small" | "large";
  /**
   * "ink" (default) = ink-colored spinner on a normal surface.
   * "onInk" = spinner sitting on a bg-ink button, so it uses the inverse
   * (cream) color and stays visible in both themes.
   */
  tone?: "ink" | "onInk";
}

export function Spinner({ size = "small", tone = "ink" }: SpinnerProps) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  // Matches --c-ink / --c-cream in global.css for each theme.
  const color =
    tone === "onInk" ? (dark ? "#121214" : "#FFFFFF") : dark ? "#F4F4F6" : "#0A0A0A";
  return <ActivityIndicator size={size} color={color} />;
}
