import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import type { FeedPostResponse } from "@/api/types";
import { CampusToday } from "@/components/CampusToday";
import { FeedPostCard } from "@/components/FeedPostCard";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { Spinner } from "@/components/Spinner";
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
    school,
    filters,
    refresh,
    deletePost,
    bookPost,
    blockUser,
    applyFilters,
    hasData,
    announcement,
  } = useFeed();
  const [booking, setBooking] = useState<string | null>(null);
  const [feedScope, setFeedScope] = useState<"all" | "offering" | "looking">("all");
  const { colorScheme } = useColorScheme();
  const refreshTint = colorScheme === "dark" ? "#F4F4F6" : "#0A0A0A";

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void refresh();
    }, [refresh]),
  );

  const onBook = async (post: FeedPostResponse) => {
    const isPassengerPost = post.postType === "PASSENGER";
    const title = isPassengerPost ? "Offer this ride?" : "Book seat?";
    const body = isPassengerPost
      ? `Offer to drive @${post.username}, ${post.origin} → ${post.destination}.`
      : `Request 1 seat from @${post.username}, ${post.origin} → ${post.destination}.`;
    const confirmLabel = isPassengerPost ? "Offer" : "Book";
    const successTitle = isPassengerPost ? "Offer sent" : "Requested";
    const successBody = isPassengerPost
      ? "The rider was notified. You can track this in Bookings."
      : "The driver was notified. You can track this in Bookings.";

    Alert.alert(title, body, [
      { text: "Cancel", style: "cancel" },
      {
        text: confirmLabel,
        onPress: async () => {
          setBooking(post.id);
          const ok = await bookPost(post.id, 1);
          setBooking(null);
          if (ok) {
            Alert.alert(successTitle, successBody);
            await refresh();
          }
        },
      },
    ]);
  };

  const onReport = (post: FeedPostResponse) =>
    navigation.navigate("Report", {
      kind: "post",
      postId: post.id,
      postSummary: `${post.origin} → ${post.destination}`,
    });

  const onBlock = (post: FeedPostResponse) =>
    Alert.alert(
      `Block @${post.username}?`,
      "You won't see their posts or receive messages from them, and they can't message you. We'll review their account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            const ok = await blockUser(post.username);
            if (ok) Alert.alert("Blocked", `You won't see @${post.username} anymore.`);
          },
        },
      ],
    );

  const onMore = (post: FeedPostResponse) =>
    Alert.alert(
      post.name ?? `@${post.username}`,
      "What would you like to do?",
      [
        { text: "Report post", onPress: () => onReport(post) },
        { text: "Block user", style: "destructive", onPress: () => onBlock(post) },
        { text: "Cancel", style: "cancel" },
      ],
    );

  const onMessage = (post: FeedPostResponse) =>
    navigation.navigate("Conversation", {
      otherUsername: post.username,
      otherName: post.name ?? undefined,
    });

  const onViewProfile = (post: FeedPostResponse) =>
    navigation.navigate("UserProfile", { username: post.username });

  const onOpen = (post: FeedPostResponse) =>
    navigation.navigate("PostDetail", {
      post,
      isOwner: !!myEmail && post.email.toLowerCase() === myEmail.toLowerCase(),
    });

  const offeringCount = posts.filter((post) => post.postType !== "PASSENGER").length;
  const lookingCount = posts.filter((post) => post.postType === "PASSENGER").length;
  const visiblePosts = posts.filter((post) => {
    if (feedScope === "offering") return post.postType !== "PASSENGER";
    if (feedScope === "looking") return post.postType === "PASSENGER";
    return true;
  });

  return (
    <Screen className="px-0">
      <View className="flex-row items-end justify-between gap-3 px-5 pb-4 pt-2">
        <Pressable
          onPress={() => navigation.navigate("Search")}
          hitSlop={6}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-cream"
        >
          <Text className="text-base text-ink">{filters ? "●" : "⬱"}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("CreatePost")}
          className="h-10 flex-row items-center gap-1.5 rounded-full bg-ink px-4"
        >
          <Text className="text-base font-semibold text-cream">+</Text>
          <Text className="text-sm font-semibold text-cream">Post</Text>
        </Pressable>
      </View>

      {announcement ? (
        <View className="mx-5 mb-3 rounded-2xl border border-line bg-cream px-4 py-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">
            Announcement
          </Text>
          <Text className="mt-1 text-sm text-ink">{announcement}</Text>
        </View>
      ) : null}

      {__DEV__ ? (
        <View className="mx-5 mb-3 rounded-2xl border border-line bg-cream p-1">
          <View className="flex-row gap-1">
            {[
              { key: "all", label: "All", count: posts.length },
              { key: "offering", label: "Offering", count: offeringCount },
              { key: "looking", label: "Looking", count: lookingCount },
            ].map((tab) => {
              const active = feedScope === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setFeedScope(tab.key as "all" | "offering" | "looking")}
                  className={`flex-1 rounded-xl px-3 py-2 ${active ? "bg-ink" : "bg-cream"}`}
                >
                  <Text className={`text-center text-xs font-semibold ${active ? "text-cream" : "text-ink"}`}>
                    {tab.label} ({tab.count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {filters ? (
        <View className="mx-5 mb-3 flex-row items-center justify-between rounded-full border border-line bg-cream-2 px-4 py-2">
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
          <Spinner />
        </View>
      ) : (
        <FlatList
          data={visiblePosts}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <View>
              <FeedPostCard
                post={item}
                isOwner={!!myEmail && item.email.toLowerCase() === myEmail.toLowerCase()}
                onDelete={deletePost}
                onBook={onBook}
                onMore={onMore}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
                onOpen={onOpen}
              />
              {booking === item.id ? (
                <View className="absolute inset-0 items-center justify-center rounded-3xl bg-cream/70">
                  <Spinner />
                </View>
              ) : null}
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32,
            gap: 10,
          }}
          ListHeaderComponent={
            filters ? null : <CampusToday school={school} hasData={!!hasData} />
          }
          ItemSeparatorComponent={() => <View className="h-0" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={refreshTint} />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-12">
              <Text className="text-base font-semibold text-ink">
                {filters
                  ? "No rides match your filters."
                  : feedScope === "offering"
                    ? "No offering rides yet."
                    : feedScope === "looking"
                      ? "No ride requests yet."
                      : "No rides yet."}
              </Text>
              <Text className="text-center text-sm text-muted">
                {filters
                  ? "Loosen the filters or clear them."
                  : feedScope === "offering"
                    ? "Try switching to all posts or create an offer."
                    : feedScope === "looking"
                      ? "Try switching to all posts or post a ride request."
                      : "Be the first to post a ride for your school."}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
