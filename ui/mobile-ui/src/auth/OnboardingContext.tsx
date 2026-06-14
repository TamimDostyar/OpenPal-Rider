/**
 * Tracks whether the signed-in user has been walked through the
 * notification + Google Calendar permission prompts. Persisted in
 * SecureStore so we only nag once per install.
 */
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

const ONBOARDED_KEY = "openpal.rider.permissionsOnboarded";

interface OnboardingState {
  onboarded: boolean;
  loading: boolean;
  markOnboarded: () => Promise<void>;
  reset: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDED_KEY)
      .then((value) => setOnboarded(value === "1"))
      .finally(() => setLoading(false));
  }, []);

  const markOnboarded = async () => {
    await SecureStore.setItemAsync(ONBOARDED_KEY, "1");
    setOnboarded(true);
  };

  const reset = async () => {
    await SecureStore.deleteItemAsync(ONBOARDED_KEY);
    setOnboarded(false);
  };

  return (
    <OnboardingContext.Provider value={{ onboarded, loading, markOnboarded, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}
