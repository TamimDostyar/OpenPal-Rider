import { useRoute, type RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { TabBar } from "@/navigation/TabBar";
import type { RootStackParamList, TabKey } from "@/navigation/types";
import { BookingsScreen } from "./BookingsScreen";
import { HomeScreen } from "./HomeScreen";
import { MessagesScreen } from "./MessagesScreen";
import { ProfileScreen } from "./ProfileScreen";
import { useConversationsBadge } from "@/hooks/useConversationsBadge";

type Route = RouteProp<RootStackParamList, "AuthedTabs">;

export function AuthedTabsScreen() {
  const route = useRoute<Route>();
  const initial = (route.params?.initialTab ?? "home") as TabKey;
  const [active, setActive] = useState<TabKey>(initial);
  const { unread, refresh: refreshBadge } = useConversationsBadge();

  useEffect(() => {
    if (route.params?.initialTab) setActive(route.params.initialTab);
  }, [route.params?.initialTab]);

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-1">
        {active === "home" && <HomeScreen />}
        {active === "bookings" && <BookingsScreen />}
        {active === "messages" && <MessagesScreen onChange={refreshBadge} />}
        {active === "profile" && <ProfileScreen />}
      </View>
      <TabBar active={active} onChange={setActive} unreadMessages={unread} />
    </View>
  );
}
