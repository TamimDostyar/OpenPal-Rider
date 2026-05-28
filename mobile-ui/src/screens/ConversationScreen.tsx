import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { Spinner } from "@/components/Spinner";
import { useConversation } from "@/hooks/useConversation";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Conversation">;

function emailFromToken(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = globalThis.atob ? globalThis.atob(padded) : "";
    if (!decoded) return null;
    const claims = JSON.parse(decoded) as { sub?: string };
    return claims.sub ?? null;
  } catch {
    return null;
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function ConversationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { otherUsername, otherName, bookingId } = route.params;
  const { messages, loading, sending, error, send } = useConversation(otherUsername, bookingId);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const { token } = useAuth();
  const myEmail = emailFromToken(token);

  // Prefer the name carried on the messages, then the param passed in by the
  // opening screen, and finally fall back to the @username.
  const nameFromMessages = messages.reduce<string | null>((found, m) => {
    if (found) return found;
    const fromOther =
      m.senderUsername === otherUsername ? m.senderName : m.recipientName;
    return fromOther ?? null;
  }, null);
  const displayName = nameFromMessages ?? otherName ?? `@${otherUsername}`;

  const onSend = async () => {
    const ok = await send(draft);
    if (ok) {
      setDraft("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <Screen className="px-0">
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable onPress={() => navigation.goBack()} className="py-2">
          <Text className="text-sm font-semibold text-muted">‹ Back</Text>
        </Pressable>
        <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {error ? (
        <View className="px-6 pb-2">
          <FormError message={error} />
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 6 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine =
              !!myEmail && item.senderEmail.toLowerCase() === myEmail.toLowerCase();
            return (
              <View className={`flex-row ${mine ? "justify-end" : "justify-start"}`}>
                <View
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                    mine ? "bg-ink" : "bg-cream border border-line"
                  }`}
                >
                  <Text className={`text-sm ${mine ? "text-cream" : "text-ink"}`}>
                    {item.text}
                  </Text>
                  <Text
                    className={`mt-0.5 text-[10px] ${
                      mine ? "text-cream/70" : "text-muted"
                    }`}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center pt-12">
              <Text className="text-sm text-muted">No messages yet. Say hi.</Text>
            </View>
          }
        />
      )}

      <View className="flex-row items-center gap-2 border-t border-line bg-cream px-3 py-2">
        <TextInput
          className="flex-1 rounded-2xl bg-cream-2 px-4 py-2 text-base text-ink"
          placeholder="Message"
          placeholderTextColor="#6B7076"
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={sending || !draft.trim()}
          className={`rounded-full px-4 py-2 ${
            sending || !draft.trim() ? "bg-line" : "bg-coral"
          }`}
        >
          <Text className="text-sm font-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
