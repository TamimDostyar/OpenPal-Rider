/**
 * Form state and submission logic for the reset-password screen. Pre-fills
 * the token from route params and routes back to Login once the reset succeeds.
 */
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ResetPassword">;

export function useResetPassword() {
  const navigation = useNavigation<Nav>();
  const params = useRoute<Route>().params;

  const [token, setToken] = useState(params?.resetToken ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!token.trim()) {
      setError("Enter your reset token.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.resetPassword({ token: token.trim(), newPassword });
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    token,
    setToken,
    newPassword,
    setNewPassword,
    error,
    submitting,
    submit,
    goBack: () => navigation.goBack(),
  };
}
