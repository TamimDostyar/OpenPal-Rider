/**
 * Drives the email-verification screen: tracks the 4-digit code, submits it
 * for verification, and exposes a resend helper that requests a fresh code.
 */
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "VerifyEmail">;

const CODE_LENGTH = 4;

export function useVerifyEmail() {
  const navigation = useNavigation<Nav>();
  const { email } = useRoute<Route>().params;

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.verifyEmail({ email, code });
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    try {
      const res = await api.resendCode(email);
      setNotice(res.message);
      setCode("");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not resend code.");
    }
  };

  return {
    email,
    code,
    setCode,
    error,
    notice,
    submitting,
    verify,
    resend,
    goBack: () => navigation.goBack(),
  };
}
