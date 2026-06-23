import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { CampusCategory } from "@/api/types";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CampusUtil {
  category: CampusCategory;
  label: string;
  subtitle: string;
  dot: string;
}
export const CAMPUS_UTILS: CampusUtil[] = [
  { category: "dining", label: "Dining", subtitle: "Hours & today's menu", dot: "bg-sun" },
  { category: "gym-hours", label: "Gym", subtitle: "Hours & facilities", dot: "bg-sky" },
  { category: "library", label: "Library", subtitle: "Hours today", dot: "bg-sage" },
  { category: "news", label: "News", subtitle: "Campus announcements", dot: "bg-ink" },
];

export function CampusToday({ school, hasData }: { school: string | null, hasData: boolean}) {
  const navigation = useNavigation<Nav>();

  if (!school || !hasData) return null;

  return (
    <View className="pb-3">
      <Text className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        On campus · today
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 9, paddingRight: 4 }}
      >
        {CAMPUS_UTILS.map((u) => (
          <Pressable
            key={u.category}
            onPress={() =>
              navigation.navigate("CampusUtility", {
                category: u.category,
                title: u.label,
                subtitle: u.subtitle,
                school,
              })
            }
            className="w-32 rounded-2xl border border-line bg-cream p-3"
          >
            <View className="mb-2 flex-row items-center gap-2">
              <View className={`h-1.5 w-1.5 rounded-full ${u.dot}`} />
              <Text className="text-xs font-semibold text-ink-2">{u.label}</Text>
            </View>
            <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
              View
            </Text>
            <Text className="mt-0.5 text-[11px] text-muted" numberOfLines={1}>
              {u.subtitle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
