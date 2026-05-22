import React from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { CodeInput } from "@/components/CodeInput";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";

export function VerifyEmailScreen() {
  const { email, code, setCode, error, notice, submitting, verify, resend } =
    useVerifyEmail();

  return (
    <Screen className="justify-between">
      <View className="gap-5 pt-4">
        <Text className="text-xs uppercase tracking-widest text-muted">
          Step 2 of 2 · verify
        </Text>
        <Text className="text-4xl font-semibold leading-tight text-ink">
          Check your inbox.
        </Text>
        <Text className="text-base leading-relaxed text-ink-2">
          We sent a 4-digit code to{" "}
          <Text className="font-semibold text-ink">{email}</Text>
        </Text>

        <FormError message={error} />
        {notice ? (
          <Text className="text-sm text-sage">{notice}</Text>
        ) : null}

        <CodeInput value={code} onChange={setCode} />

        <Pressable onPress={resend} className="self-start">
          <Text className="text-sm text-muted">
            Didn't get it?{" "}
            <Text className="font-semibold text-ink">Resend code</Text>
          </Text>
        </Pressable>
      </View>

      <View className="pb-4">
        <Button
          label="Verify & create account"
          onPress={verify}
          loading={submitting}
        />
      </View>
    </Screen>
  );
}
