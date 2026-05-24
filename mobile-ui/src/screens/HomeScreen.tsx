import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { FeedPostCard } from "@/components/FeedPostCard";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/auth/AuthContext";
import { useFeed } from "@/hooks/useFeed";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const { posts, loading, refreshing, error, myEmail, refresh, deletePost } = useFeed();

  const schoolDomain = myEmail?.split("@")[1] ?? null;

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
          onPress={() => navigation.navigate("CreatePost")}
          className="rounded-full bg-coral px-4 py-2"
        >
          <Text className="text-sm font-semibold text-white">+ New post</Text>
        </Pressable>
      </View>

      {error ? (
        <View className="px-6 pb-2">
          <FormError message={error} />
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1A1815" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <FeedPostCard
              post={item}
              isOwner={!!myEmail && item.email.toLowerCase() === myEmail.toLowerCase()}
              onDelete={deletePost}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 12,
          }}
          ItemSeparatorComponent={() => <View className="h-0" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1A1815" />
          }
          ListEmptyComponent={
            <View className="items-center gap-2 pt-12">
              <Text className="text-base font-semibold text-ink">No rides yet.</Text>
              <Text className="text-center text-sm text-muted">
                Be the first to post a ride for your school.
              </Text>
            </View>
          }
        />
      )}

      <View className="border-t border-line px-6 pb-3 pt-2">
        <Pressable onPress={signOut} className="self-end py-2">
          <Text className="text-sm font-semibold text-muted">Sign out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
