import React from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useLogin } from "@/hooks/useLogin";

export function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    submit,
    goToForgotPassword,
    goToSignup,
  } = useLogin();

  return (
    <Screen className="justify-between">
      <View className="gap-5 pt-4">
        <Text className="text-4xl font-semibold leading-tight text-ink">
          Welcome back.
        </Text>

        <FormError message={error} />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.edu"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />

        <Pressable onPress={goToForgotPassword} className="self-end">
          <Text className="text-sm font-semibold text-coral-dk">
            Forgot password?
          </Text>
        </Pressable>
      </View>

      <View className="gap-3 pb-4">
        <Button label="Log in" onPress={submit} loading={submitting} />
        <Pressable onPress={goToSignup} className="py-2">
          <Text className="text-center text-sm text-muted">
            New here? <Text className="font-semibold text-ink">Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
