/**
 * Settings screen reached from the gear icon on the Profile tab. Holds account
 * management actions: the list of users you've blocked (with unblock), and
 * permanent account deletion.
 */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ApiError, api } from "@/api/client";
import type { BlockResponse } from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { Spinner } from "@/components/Spinner";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { token, signOut } = useAuth();

  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBlocks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.blocks.mine(token);
      setBlocks(list);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401 || e.status === 403) {
          await signOut();
          return;
        }
        setError(e.message);
      } else {
        setError("Couldn't load your blocked users.");
      }
    } finally {
      setLoading(false);
    }
  }, [signOut, token]);

  useFocusEffect(
    useCallback(() => {
      void loadBlocks();
    }, [loadBlocks]),
  );

  const onUnblock = (username: string) => {
    Alert.alert(
      `Unblock @${username}?`,
      "You'll start seeing their posts again, and you'll both be able to message each other.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            if (!token) return;
            const previous = blocks;
            setUnblocking(username);
            setBlocks((curr) =>
              curr.filter(
                (b) => b.blockedUsername.toLowerCase() !== username.toLowerCase(),
              ),
            );
            try {
              await api.blocks.remove(token, username);
            } catch (e) {
              setBlocks(previous);
              if (e instanceof ApiError) {
                if (e.status === 401 || e.status === 403) {
                  await signOut();
                  return;
                }
                Alert.alert("Couldn't unblock", e.message);
              } else {
                Alert.alert("Couldn't unblock", "Please try again.");
              }
            } finally {
              setUnblocking(null);
            }
          },
        },
      ],
    );
  };

  const performDelete = async () => {
    if (!token || deleting) return;
    setDeleting(true);
    try {
      await api.profile.deleteAccount(token);
      await signOut();
    } catch (e) {
      setDeleting(false);
      Alert.alert(
        "Delete failed",
        e instanceof ApiError ? e.message : "Couldn't delete your account. Please try again.",
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account, your posts, and your profile. " +
        "This can't be undone, and you won't be able to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => void performDelete(),
        },
      ],
    );
  };

  return (
    <Screen className="px-0">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="py-2">
          <Text className="text-sm font-semibold text-ink">← Back</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">Settings</Text>
        <View className="w-12" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 20, paddingTop: 8 }}
      >
        {error ? <FormError message={error} /> : null}

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Blocked users
          </Text>
          <Text className="text-xs text-muted">
            You won't see posts from these users, and you can't message each other.
          </Text>

          {loading ? (
            <View className="items-center py-6">
              <Spinner />
            </View>
          ) : blocks.length === 0 ? (
            <View className="items-center rounded-2xl border border-line bg-cream py-6">
              <Text className="text-sm text-muted">You haven't blocked anyone.</Text>
            </View>
          ) : (
            blocks.map((b) => (
              <View
                key={b.id}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-cream p-3"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-cream-2">
                  <Text className="text-sm font-semibold text-ink">
                    {(b.blockedUsername[0] ?? "?").toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                    @{b.blockedUsername}
                  </Text>
                  {b.reason ? (
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {b.reason}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => onUnblock(b.blockedUsername)}
                  disabled={unblocking === b.blockedUsername}
                  className="rounded-full border border-line px-3 py-1.5"
                >
                  <Text className="text-xs font-semibold text-ink">
                    {unblocking === b.blockedUsername ? "…" : "Unblock"}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View className="gap-2 border-t border-line pt-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </Text>
          <Pressable
            onPress={confirmDelete}
            disabled={deleting}
            className="items-center rounded-full border border-coral py-2.5"
          >
            <Text className="text-sm font-semibold text-coral">
              {deleting ? "Deleting…" : "Delete account"}
            </Text>
          </Pressable>
          <Text className="text-center text-xs text-muted">
            Permanently deletes your account and data. This can't be undone.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
