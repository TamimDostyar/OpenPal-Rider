/**
 * "On campus today" — a horizontal strip of read-only campus utilities pulled
 * live from the school's own website (dining, gym, library, news). Tapping a
 * card opens the full list on CampusUtilityScreen. The whole strip is a pure
 * presenter: it shows what the backend scrapes and never posts anything.
 *
 * The school name is the one the user registered with (e.g. "Luther College"),
 * which the backend uses to pick the right site to scrape.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { CampusCategory } from "@/api/types";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CampusUtil {
  category: CampusCategory;
  /** Short card label. */
  label: string;
  /** One-line caption under the title on the detail screen. */
  subtitle: string;
  /** Accent dot color class (a semantic theme color). */
  dot: string;
}

// Only the categories the backend can actually scrape today.
export const CAMPUS_UTILS: CampusUtil[] = [
  { category: "meal", label: "Dining", subtitle: "Today's menu", dot: "bg-sun" },
  { category: "gym-hours", label: "Gym", subtitle: "Hours & facilities", dot: "bg-sky" },
  { category: "library", label: "Library", subtitle: "Hours today", dot: "bg-sage" },
  { category: "news", label: "News", subtitle: "Campus announcements", dot: "bg-ink" },
];

export function CampusToday({ school }: { school: string | null }) {
  const navigation = useNavigation<Nav>();

  // Without a school we can't target the scraper, so don't show the strip.
  if (!school) return null;

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
