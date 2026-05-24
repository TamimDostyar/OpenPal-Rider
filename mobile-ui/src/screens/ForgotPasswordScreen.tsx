/**
 * Entry point to the password-reset flow. Asks for an email and requests a
 * one-time reset token from the backend.
 */
import React from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export function ForgotPasswordScreen() {
  const {
    email,
    setEmail,
    message,
    error,
    submitting,
    submit,
    goToResetPassword,
  } = useForgotPassword();

  return (
    <Screen className="justify-between">
      <View className="gap-5 pt-4">
        <Text className="text-4xl font-semibold leading-tight text-ink">
          Reset your password.
        </Text>
        <Text className="text-base leading-relaxed text-ink-2">
          Enter your email and we'll issue a one-time reset token.
        </Text>

        <FormError message={error} />
        {message ? (
          <View className="rounded-2xl bg-cream-2 px-4 py-3">
            <Text className="text-sm text-ink-2">{message}</Text>
          </View>
        ) : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.edu"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View className="gap-3 pb-4">
        <Button label="Send reset token" onPress={submit} loading={submitting} />
        <Button
          label="I have a token"
          variant="ghost"
          onPress={goToResetPassword}
        />
      </View>
    </Screen>
  );
}
