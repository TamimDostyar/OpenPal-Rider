import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useConversations } from "@/hooks/useConversations";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MessagesScreenProps {
  onChange?: () => void;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function MessagesScreen({ onChange }: MessagesScreenProps) {
  const navigation = useNavigation<Nav>();
  const { items, loading, refreshing, error, refresh } = useConversations();

  useEffect(() => {
    onChange?.();
  }, [items, onChange]);

  return (
    <Screen className="px-0">
      <View className="px-6 pb-3 pt-2">
        <Text className="text-2xl font-semibold text-ink">Messages</Text>
      </View>

      {error ? (
        <View className="px-6 pb-2">
          <FormError message={error} />
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#120C0A" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => c.otherEmail}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("Conversation", {
                  otherUsername: item.otherUsername,
                })
              }
              className="flex-row items-center gap-3 rounded-3xl border border-line bg-white p-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-cream-2">
                <Text className="text-base font-semibold text-ink">
                  {item.otherUsername[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-ink">
                    @{item.otherUsername}
                  </Text>
                  <Text className="text-xs text-muted">
                    {relativeTime(item.lastMessage.createdAt)}
                  </Text>
                </View>
                <Text className="text-sm text-ink-2" numberOfLines={1}>
                  {item.lastMessage.text}
                </Text>
              </View>
              {item.unreadCount > 0 ? (
                <View className="h-6 min-w-6 items-center justify-center rounded-full bg-coral px-1.5">
                  <Text className="text-xs font-semibold text-white">
                    {item.unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 10,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#120C0A" />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-12">
              <Text className="text-base font-semibold text-ink">No messages.</Text>
              <Text className="text-center text-sm text-muted">
                Tap a rider or driver in the feed or a booking to start a chat.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
