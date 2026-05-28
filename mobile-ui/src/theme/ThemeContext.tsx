/**
 * App-wide theme control. Persists the user's preference (light / dark /
 * system) in SecureStore and drives the palette two ways:
 *
 *  1. colorScheme.set() — so NativeWind's `dark:` variants and useColorScheme()
 *     reflect the choice.
 *  2. A root <View> that applies the active palette as CSS variables via vars().
 *     Every descendant resolves bg-cream / text-ink / … from these, so the
 *     whole app re-themes instantly. This runtime approach is deterministic and
 *     doesn't depend on .dark:root CSS compilation.
 *
 * Keep the channel values in sync with global.css.
 */
import { colorScheme as nwColorScheme, useColorScheme, vars } from "nativewind";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { View } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "openpal.theme-mode";

const LIGHT = vars({
  "--c-cream": "255 255 255",
  "--c-cream-2": "245 245 247",
  "--c-canvas": "240 240 243",
  "--c-ink": "10 10 10",
  "--c-ink-2": "31 32 36",
  "--c-muted": "107 112 118",
  "--c-line": "228 228 231",
  "--c-line-2": "238 238 241",
  "--c-coral": "220 38 38",
  "--c-coral-dk": "185 28 28",
  "--c-sage": "14 124 102",
  "--c-sage-2": "10 92 77",
  "--c-sun": "194 65 12",
  "--c-sky": "71 85 105",
  "--c-rose": "159 18 57",
  "--c-driver": "14 124 102",
  "--c-driver-bg": "230 244 240",
  "--c-driver-border": "194 226 217",
  "--c-passenger": "220 38 38",
  "--c-passenger-bg": "254 231 231",
  "--c-passenger-border": "244 194 194",
});

const DARK = vars({
  "--c-cream": "18 18 20",
  "--c-cream-2": "28 28 32",
  "--c-canvas": "9 9 11",
  "--c-ink": "244 244 246",
  "--c-ink-2": "212 212 216",
  "--c-muted": "148 152 158",
  "--c-line": "46 46 52",
  "--c-line-2": "38 38 43",
  "--c-coral": "239 68 68",
  "--c-coral-dk": "220 38 38",
  "--c-sage": "21 168 138",
  "--c-sage-2": "16 130 108",
  "--c-sun": "251 146 60",
  "--c-sky": "148 163 184",
  "--c-rose": "251 113 133",
  "--c-driver": "21 168 138",
  "--c-driver-bg": "14 42 36",
  "--c-driver-border": "31 74 64",
  "--c-passenger": "239 68 68",
  "--c-passenger-bg": "46 20 20",
  "--c-passenger-border": "90 36 36",
});

interface ThemeContextValue {
  /** The user's saved preference. */
  mode: ThemeMode;
  /** The actually-applied scheme after resolving "system". */
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const { colorScheme } = useColorScheme();

  // Load the saved preference once and apply it.
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        const next = (saved as ThemeMode | null) ?? "system";
        setModeState(next);
        nwColorScheme.set(next);
      })
      .catch(() => nwColorScheme.set("system"));
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    nwColorScheme.set(next);
    void SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
  };

  const resolved = colorScheme === "dark" ? "dark" : "light";

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      <View style={resolved === "dark" ? DARK : LIGHT} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
