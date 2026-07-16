/**
 * React context that holds the authenticated user's JWT and persists it in
 * SecureStore. Exposes signIn/signOut helpers and a useAuth hook for consumers.
 */
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

import { registerPushToken } from "@/services/notifications";

const TOKEN_KEY = "openpal.rider.jwt";

interface AuthState {
  token: string | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((saved) => setToken(saved))
      .finally(() => setLoading(false));
  }, []);

  // Whenever we have a JWT (fresh sign-in or restored from storage), make sure
  // this device's push token is registered with the backend. Fire-and-forget:
  // registerPushToken never throws.
  useEffect(() => {
    if (token) {
      void registerPushToken(token);
    }
  }, [token]);

  const signIn = async (next: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, next);
    setToken(next);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  else{
    return ctx;
  }
  // return ctx;
}
