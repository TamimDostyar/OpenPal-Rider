/**
 * Form state and submission logic for the forgot-password screen. Asks the
 * backend to issue a reset token and surfaces the resulting message to the UI.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useForgotPassword() {
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    message,
    error,
    submitting,
    submit,
    goToResetPassword: () => navigation.navigate("ResetPassword", {}),
    goBack: () => navigation.goBack(),
  };
}
