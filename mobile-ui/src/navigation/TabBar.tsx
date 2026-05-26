import React from "react";
import { Pressable, Text, View } from "react-native";

import type { TabKey } from "./types";

interface TabBarProps {
  active: TabKey;
  onChange: (next: TabKey) => void;
  unreadMessages?: number;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "home", label: "Feed", icon: "◎" },
  { key: "bookings", label: "Bookings", icon: "✓" },
  { key: "messages", label: "Messages", icon: "✉" },
  { key: "profile", label: "Profile", icon: "☻" },
];

export function TabBar({ active, onChange, unreadMessages = 0 }: TabBarProps) {
  return (
    <View className="flex-row items-stretch border-t border-line bg-cream">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const showBadge = tab.key === "messages" && unreadMessages > 0;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="flex-1 items-center py-2.5"
          >
            <View className="relative">
              <Text className={`text-xl ${isActive ? "text-ink" : "text-muted"}`}>
                {tab.icon}
              </Text>
              {showBadge ? (
                <View className="absolute -right-3 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1">
                  <Text className="text-[10px] font-semibold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              className={`mt-0.5 text-[11px] font-semibold ${
                isActive ? "text-ink" : "text-muted"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
