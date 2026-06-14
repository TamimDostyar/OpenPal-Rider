/**
 * Second step of the password-reset flow: accepts the reset token and a new
 * password, then routes the user back to login on success.
 */
import React from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useResetPassword } from "@/hooks/useResetPassword";

export function ResetPasswordScreen() {
  const {
    token,
    setToken,
    newPassword,
    setNewPassword,
    error,
    submitting,
    submit,
  } = useResetPassword();

  return (
    <Screen className="justify-between">
      <View className="gap-5 pt-4">
        <Text className="text-4xl font-semibold leading-tight text-ink">
          Choose a new password.
        </Text>

        <FormError message={error} />

        <TextField
          label="Reset token"
          value={token}
          onChangeText={setToken}
          placeholder="Paste your reset token"
          autoCapitalize="none"
        />
        <TextField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 8 characters"
          secureTextEntry
        />
      </View>

      <View className="pb-4">
        <Button label="Reset password" onPress={submit} loading={submitting} />
      </View>
    </Screen>
  );
}
