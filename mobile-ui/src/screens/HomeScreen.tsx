import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import type { FeedPostResponse } from "@/api/types";
import { FeedPostCard } from "@/components/FeedPostCard";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useFeed } from "@/hooks/useFeed";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {
    posts,
    loading,
    refreshing,
    error,
    myEmail,
    filters,
    refresh,
    deletePost,
    bookPost,
    applyFilters,
  } = useFeed();
  const [booking, setBooking] = useState<string | null>(null);

  const schoolDomain = myEmail?.split("@")[1] ?? null;

  const onBook = async (post: FeedPostResponse) => {
    Alert.alert(
      "Book seat?",
      `Request 1 seat from @${post.username}, ${post.origin} → ${post.destination}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: async () => {
            setBooking(post.id);
            const ok = await bookPost(post.id, 1);
            setBooking(null);
            if (ok) {
              Alert.alert(
                "Requested",
                "The driver was notified. You can track this in Bookings.",
              );
              await refresh();
            }
          },
        },
      ],
    );
  };

  const onReport = (post: FeedPostResponse) =>
    navigation.navigate("Report", {
      kind: "post",
      postId: post.id,
      postSummary: `${post.origin} → ${post.destination}`,
    });

  const onMessage = (post: FeedPostResponse) =>
    navigation.navigate("Conversation", { otherUsername: post.username });

  return (
    <Screen className="px-0">
      <View className="flex-row items-center justify-between px-6 pb-3 pt-2">
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-ink">Feed</Text>
          {schoolDomain ? (
            <Text className="text-xs text-muted">@{schoolDomain}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => navigation.navigate("Search")}
          className="mr-2 rounded-full border border-line bg-white px-3 py-2"
        >
          <Text className="text-sm font-semibold text-ink">
            {filters ? "Filters ●" : "Search"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("CreatePost")}
          className="rounded-full bg-coral px-4 py-2"
        >
          <Text className="text-sm font-semibold text-white">+ New</Text>
        </Pressable>
      </View>

      {filters ? (
        <View className="mx-6 mb-2 flex-row items-center justify-between rounded-2xl bg-cream-2 px-3 py-2">
          <Text className="flex-1 text-xs text-ink-2" numberOfLines={1}>
            Filtered{filters.destination ? ` · to "${filters.destination}"` : ""}
            {filters.maxPrice !== undefined ? ` · ≤$${filters.maxPrice}` : ""}
            {filters.minSeats !== undefined ? ` · ≥${filters.minSeats} seats` : ""}
          </Text>
          <Pressable onPress={() => applyFilters(null)} className="ml-2">
            <Text className="text-xs font-semibold text-coral-dk">Clear</Text>
          </Pressable>
        </View>
      ) : null}

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
          data={posts}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <View>
              <FeedPostCard
                post={item}
                isOwner={!!myEmail && item.email.toLowerCase() === myEmail.toLowerCase()}
                onDelete={deletePost}
                onBook={onBook}
                onReport={onReport}
                onMessage={onMessage}
              />
              {booking === item.id ? (
                <View className="absolute inset-0 items-center justify-center rounded-3xl bg-cream/70">
                  <ActivityIndicator color="#120C0A" />
                </View>
              ) : null}
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 12,
          }}
          ItemSeparatorComponent={() => <View className="h-0" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#120C0A" />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-12">
              <Text className="text-base font-semibold text-ink">
                {filters ? "No rides match your filters." : "No rides yet."}
              </Text>
              <Text className="text-center text-sm text-muted">
                {filters
                  ? "Loosen the filters or clear them."
                  : "Be the first to post a ride for your school."}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
