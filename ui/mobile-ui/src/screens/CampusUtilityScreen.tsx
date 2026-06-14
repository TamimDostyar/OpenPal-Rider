
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError, api } from "@/api/client";
import type {
  CampusCategory,
  MenuDaypart,
  ScrapeItem,
} from "@/api/types";
import { FormError } from "@/components/FormError";
import { Spinner } from "@/components/Spinner";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "CampusUtility">;

async function openLink(url: string) {
  try {
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert("Can't open link", url);
  } catch {
    Alert.alert("Can't open link", url);
  }
}

export function CampusUtilityScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { category, title, subtitle, school } = route.params;
  const insets = useSafeAreaInsets();
  const headerTopPad = Platform.OS === "ios" ? 14 : Math.max(insets.top, 12) + 6;

  // Dining is a composite (café hours + today's menu); every other category is a
  // flat scrape feed. We keep one state slot for each and switch on the category.
  const [items, setItems] = useState<ScrapeItem[] | null>(null);
  const [dining, setDining] = useState<DiningData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (category === "dining") {
        const [menu, hours] = await Promise.all([
          api.schools.menu(school),
          api.schools.cafeHours(school),
        ]);
        setDining({ menu, hours });
      } else {
        setItems(await api.schools.byCategory(school, category));
      }
    } catch (e) {
      if (category === "dining") setDining({ menu: [], hours: [] });
      else setItems([]);
      if (e instanceof ApiError) setError(e.message);
      else setError("Couldn't load this right now.");
    }
  }, [category, school]);

  useEffect(() => {
    void load();
  }, [load]);

  const loading = category === "dining" ? dining === null : items === null;
  const isEmpty =
    category === "dining"
      ? !!dining && dining.menu.length === 0 && dining.hours.length === 0
      : !!items && items.length === 0;

  return (
    <SafeAreaView
      className="flex-1 bg-cream"
      edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
    >
      <View
        className="flex-row items-center justify-between border-b border-line px-5 pb-4"
        style={{ paddingTop: headerTopPad }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} className="min-w-[64px] py-1">
          <Text className="text-sm font-semibold text-muted">Close</Text>
        </Pressable>
        <View className="items-center">
          <Text className="text-base font-semibold text-ink">{title}</Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {school}
          </Text>
        </View>
        <View className="min-w-[64px]" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            {subtitle}
          </Text>

          {error ? <FormError message={error} /> : null}

          {!error && isEmpty ? (
            <View className="items-center py-12">
              <Text className="text-sm text-muted">Nothing to show right now.</Text>
            </View>
          ) : category === "dining" ? (
            dining ? <DiningView data={dining} /> : null
          ) : items ? (
            <CategoryBody category={category} items={items} />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function CategoryBody({
  category,
  items,
}: {
  category: CampusCategory;
  items: ScrapeItem[];
}) {
  switch (category) {
    case "news":
      return <NewsView items={items} />;
    case "gym-hours":
      return <GymView items={items} />;
    case "library":
      return <LibraryView items={items} />;
    case "dining":
      return null; // dining is rendered by DiningView, not from a flat feed
  }
}

/* ------------------------------- shared UI ------------------------------- */

function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-line bg-cream p-4">
      {title ? (
        <Text className="mb-2 text-sm font-bold text-ink">{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

function HoursRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2.5 ${
        last ? "" : "border-b border-line-2"
      }`}
    >
      <Text className="flex-1 pr-3 text-sm text-ink-2">{label}</Text>
      <Text className="text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}

/* --------------------------------- news --------------------------------- */

function NewsView({ items }: { items: ScrapeItem[] }) {
  return (
    <View className="gap-3">
      {items.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => item.link && void openLink(item.link)}
          className="overflow-hidden rounded-2xl border border-line bg-cream"
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", aspectRatio: 3 / 2 }}
              className="bg-cream-2"
              resizeMode="cover"
            />
          ) : null}
          <View className="p-4">
            <Text className="text-base font-semibold leading-5 text-ink">{item.text}</Text>
            {item.link ? (
              <Text className="mt-2 text-xs font-semibold text-sage">Read article →</Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------------------------------- gym --------------------------------- */

// Matches "Monday-Thursday: 6:00 a.m. - 7:00 p.m." anywhere in a blob of text.
const TIME = "\\d{1,2}(?::\\d{2})?\\s*[ap]\\.?m\\.?";
const GYM_HOURS_RE = new RegExp(
  `([A-Za-z]+(?:\\s*[-–]\\s*[A-Za-z]+)?):\\s*(${TIME})\\s*(?:-|–|to)\\s*(${TIME})`,
  "gi",
);

interface ParsedHours {
  rows: { day: string; hours: string }[];
  /** Description text that appears before the hours table. */
  about: string;
  /** Whether the source mentions a scheduled closure. */
  hasClosure: boolean;
}

function parseGymHours(text: string): ParsedHours {
  const rows: ParsedHours["rows"] = [];
  let firstIndex = text.length;
  GYM_HOURS_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = GYM_HOURS_RE.exec(text))) {
    if (m.index < firstIndex) firstIndex = m.index;
    rows.push({
      day: m[1].replace(/\s*[-–]\s*/, "–").trim(),
      hours: `${m[2].trim()} – ${m[3].trim()}`,
    });
  }
  // Everything before the hours table is descriptive copy. Trim the dangling
  // "… Summer Hours" label that usually introduces the table.
  const about = (firstIndex < text.length ? text.slice(0, firstIndex) : text)
    .replace(/\b(?:Finals Week and )?(?:Summer )?Hours\s*$/i, "")
    .trim();
  return { rows, about, hasClosure: /\bCLOSED\b/i.test(text) };
}

function GymView({ items }: { items: ScrapeItem[] }) {
  // Gym comes back as a single descriptive blob with the hours buried inside.
  const blob = items.map((i) => i.text).join("\n");
  const { rows, about, hasClosure } = parseGymHours(blob);

  return (
    <View className="gap-3">
      {rows.length > 0 ? (
        <SectionCard title="Hours">
          {rows.map((r, i) => (
            <HoursRow key={i} label={r.day} value={r.hours} last={i === rows.length - 1} />
          ))}
        </SectionCard>
      ) : null}

      {hasClosure ? (
        <View className="rounded-2xl border border-coral/30 bg-coral/10 p-3.5">
          <Text className="text-xs font-bold uppercase tracking-wider text-coral-dk">
            Scheduled closure
          </Text>
          <Text className="mt-1 text-xs leading-5 text-ink-2">
            A closure is noted in the details below — check before you go.
          </Text>
        </View>
      ) : null}

      {about ? (
        <SectionCard title="About">
          <Text className="text-sm leading-6 text-ink-2">{about}</Text>
        </SectionCard>
      ) : null}

      {rows.length === 0 && !about ? (
        <SectionCard>
          <Text className="text-sm leading-6 text-ink-2">{blob}</Text>
        </SectionCard>
      ) : null}
    </View>
  );
}

/* -------------------------------- library ------------------------------- */

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const LIBRARY_RE = new RegExp(`^(.*?)\\s+(${WEEKDAYS.join("|")})\\s+(.*)$`, "i");

interface LibraryGroup {
  location: string;
  link: string | null;
  rows: { day: string; hours: string }[];
}

function groupLibrary(items: ScrapeItem[]): LibraryGroup[] {
  const groups = new Map<string, LibraryGroup>();
  for (const item of items) {
    const m = item.text.match(LIBRARY_RE);
    const location = m ? m[1].trim() : item.text.trim();
    const group =
      groups.get(location) ?? { location, link: item.link, rows: [] };
    if (m) group.rows.push({ day: m[2], hours: m[3].trim() });
    if (!group.link && item.link) group.link = item.link;
    groups.set(location, group);
  }
  return [...groups.values()];
}

function LibraryView({ items }: { items: ScrapeItem[] }) {
  const groups = groupLibrary(items);
  return (
    <View className="gap-3">
      {groups.map((g, gi) => (
        <SectionCard key={gi} title={g.location}>
          {g.rows.length > 0 ? (
            g.rows.map((r, i) => (
              <HoursRow key={i} label={r.day} value={r.hours} last={i === g.rows.length - 1} />
            ))
          ) : (
            <Text className="text-sm text-muted">Hours unavailable.</Text>
          )}
          {g.link ? (
            <Pressable onPress={() => g.link && void openLink(g.link)} className="pt-3">
              <Text className="text-xs font-semibold text-sage">Visit library site →</Text>
            </Pressable>
          ) : null}
        </SectionCard>
      ))}
    </View>
  );
}

/* -------------------------------- dining -------------------------------- */

interface DiningData {
  menu: MenuDaypart[];
  hours: ScrapeItem[];
}

// Café-hours feed comes back as one line per café, e.g. "The Caf Closed" or
// "Nordic Brew Tomorrow: Coffee Shop From 7:30 am to 11:00 am". Split the café
// name from its status, which always begins at one of these words.
const CAFE_STATUS_RE = /\b(Closed|Open|Today|Tomorrow|From)\b/;

function splitCafe(text: string): { name: string; status: string } {
  const m = text.match(CAFE_STATUS_RE);
  if (!m || m.index === undefined) return { name: text.trim(), status: "" };
  return {
    name: text.slice(0, m.index).trim(),
    status: text.slice(m.index).trim(),
  };
}

// "07:30" → "7:30 am"; passes through anything that isn't a 24h time.
function formatTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return t;
  const h = Number(m[1]);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

function DietaryTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <View className="mt-1 flex-row flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <View key={i} className="rounded-full bg-cream-2 px-2 py-0.5">
          <Text className="text-[10px] font-medium text-ink-2">{t}</Text>
        </View>
      ))}
    </View>
  );
}

function DiningView({ data }: { data: DiningData }) {
  const { menu, hours } = data;
  return (
    <View className="gap-3">
      {hours.length > 0 ? (
        <SectionCard title="Café hours">
          {hours.map((item, i) => {
            const { name, status } = splitCafe(item.text);
            return (
              <HoursRow
                key={i}
                label={name}
                value={status || "—"}
                last={i === hours.length - 1}
              />
            );
          })}
        </SectionCard>
      ) : null}

      {menu.map((dp, di) => (
        <SectionCard
          key={di}
          title={
            dp.start && dp.end
              ? `${dp.label} · ${formatTime(dp.start)} – ${formatTime(dp.end)}`
              : dp.label
          }
        >
          {dp.stations.map((st, si) => (
            <View key={si} className={si === 0 ? "" : "mt-3"}>
              {st.name ? (
                <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  {st.name}
                </Text>
              ) : null}
              {st.items.map((dish, ii) => (
                <View
                  key={ii}
                  className={`py-2.5 ${
                    ii === st.items.length - 1 ? "" : "border-b border-line-2"
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <Text className="flex-1 pr-3 text-sm text-ink-2">{dish.name}</Text>
                    {dish.price ? (
                      <Text className="text-sm font-semibold text-ink">${dish.price}</Text>
                    ) : null}
                  </View>
                  <DietaryTags tags={dish.dietary} />
                </View>
              ))}
            </View>
          ))}
        </SectionCard>
      ))}
    </View>
  );
}
