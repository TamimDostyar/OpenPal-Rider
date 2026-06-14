/**
 * Email/password login form. Submits to the backend and stores the returned
 * JWT through the auth context on success.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useLogin } from "@/hooks/useLogin";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
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
          Welcome
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
        <Text className="text-center text-xs leading-5 text-muted">
          By continuing, you agree to our{" "}
          <Text
            className="font-semibold text-ink underline"
            onPress={() => navigation.navigate("Terms")}
          >
            Terms &amp; Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="font-semibold text-ink underline"
            onPress={() => navigation.navigate("Privacy")}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </Screen>
  );
}
