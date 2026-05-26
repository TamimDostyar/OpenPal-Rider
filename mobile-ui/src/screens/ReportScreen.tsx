import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Report">;

const REASONS = [
  "Spam or scam",
  "Inappropriate content",
  "Harassment",
  "Unsafe driving",
  "No-show",
  "Other",
];

export function ReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { token, signOut } = useAuth();
  const params = route.params;

  const [reason, setReason] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!token) return;
    if (!reason) {
      setError("Pick a reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload =
        params.kind === "post"
          ? { targetType: "POST" as const, targetPostId: params.postId, reason, text: text.trim() || undefined }
          : { targetType: "USER" as const, targetUsername: params.username, reason, text: text.trim() || undefined };
      await api.reports.create(token, payload);
      Alert.alert("Report submitted", "Thanks. We'll review it.");
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          await signOut();
          return;
        }
        setError(err.message);
      } else {
        setError("Couldn't submit the report.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} className="py-2">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">
          Report {params.kind === "post" ? "post" : "user"}
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 14, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormError message={error} />

        <View className="gap-1 rounded-3xl border border-line bg-white p-4">
          <Text className="text-xs text-muted">
            {params.kind === "post" ? "Reporting post" : "Reporting user"}
          </Text>
          <Text className="text-base font-semibold text-ink">
            {params.kind === "post"
              ? params.postSummary ?? params.postId
              : `@${params.username}`}
          </Text>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Reason
          </Text>
          <View className="gap-2">
            {REASONS.map((r) => {
              const active = r === reason;
              return (
                <Pressable
                  key={r}
                  onPress={() => setReason(r)}
                  className={`rounded-2xl border px-4 py-3 ${
                    active ? "border-ink bg-cream-2" : "border-line bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-ink" : "text-ink-2"
                    }`}
                  >
                    {r}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Details (optional)
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What happened?"
            placeholderTextColor="#7A6A5E"
            multiline
            className="min-h-28 rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink"
          />
        </View>

        <View className="pt-2">
          <Button label="Submit report" onPress={submit} loading={submitting} />
        </View>
      </ScrollView>
    </Screen>
  );
}
