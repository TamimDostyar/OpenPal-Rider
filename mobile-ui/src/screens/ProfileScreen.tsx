import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError, api } from "@/api/client";
import type {
  FeedPostResponse,
  MyProfile,
  UserRatingsResponse,
} from "@/api/types";
import { useAuth } from "@/auth/AuthContext";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { Spinner } from "@/components/Spinner";
import { useVehicle } from "@/hooks/useVehicle";
import type { RootStackParamList } from "@/navigation/types";
import { useTheme, type ThemeMode } from "@/theme/ThemeContext";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BUG_REPORT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe3zd3k3IRQ-rh_Y12asBzfg4OK1nXxY_6eUa6CdP-KQ1fWxQ/viewform?usp=publish-editor";
const BIO_MAX = 200;

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; profile: MyProfile; rides: FeedPostResponse[]; ratings: UserRatingsResponse | null }
  | { kind: "session-expired"; message: string }
  | { kind: "error"; message: string };

function initialsFor(label: string): string {
  return (
    label
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

async function fetchProfile(token: string): Promise<LoadState> {
  try {
    const profile = await api.profile.me(token);
    const [ridesR, ratingsR] = await Promise.allSettled([
      api.feed.myRides(token),
      api.ratings.forUser(token, profile.username),
    ]);
    return {
      kind: "ready",
      profile,
      rides: ridesR.status === "fulfilled" ? ridesR.value : [],
      ratings: ratingsR.status === "fulfilled" ? ratingsR.value : null,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      // Only 401/403 mean "this token no longer works." A 404 means the
      // endpoint itself wasn't found on the server (most often: backend
      // not rebuilt to include /api/profile/me) — that's a server-side
      // problem, not an expired session.
      if (e.status === 401 || e.status === 403) {
        return { kind: "session-expired", message: e.message || "Your session expired." };
      }
      return { kind: "error", message: e.message };
    }
    return { kind: "error", message: "Couldn't load your profile." };
  }
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { token, signOut } = useAuth();
  const { info: vehicle } = useVehicle();
  const { mode, setMode, resolved } = useTheme();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);

  const reload = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!token) return;
      if (mode === "initial") setState({ kind: "loading" });
      else setRefreshing(true);
      const next = await fetchProfile(token);
      setState(next);
      setRefreshing(false);
    },
    [token],
  );

  useEffect(() => {
    void reload("initial");
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload("refresh");
    }, [reload]),
  );

  const openBugReport = async () => {
    try {
      const ok = await Linking.canOpenURL(BUG_REPORT_URL);
      if (ok) await Linking.openURL(BUG_REPORT_URL);
      else Alert.alert("Can't open link", BUG_REPORT_URL);
    } catch {
      Alert.alert("Can't open link", BUG_REPORT_URL);
    }
  };

  if (state.kind === "loading") {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </Screen>
    );
  }

  if (state.kind === "session-expired") {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-xl font-semibold text-ink">Session expired</Text>
          <Text className="text-center text-sm text-muted">
            {state.message}. Sign in again to keep using OpenPal.
          </Text>
          <Pressable
            onPress={signOut}
            className="mt-2 rounded-full bg-ink px-6 py-2.5"
          >
            <Text className="text-sm font-semibold text-cream">Sign in again</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (state.kind === "error") {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-base font-semibold text-ink">Couldn't load profile.</Text>
          <Text className="text-center text-sm text-muted">{state.message}</Text>
          <Pressable
            onPress={() => void reload("initial")}
            className="mt-2 rounded-full bg-ink px-5 py-2"
          >
            <Text className="text-sm font-semibold text-cream">Try again</Text>
          </Pressable>
          <Pressable onPress={signOut} hitSlop={8} className="py-2">
            <Text className="text-xs font-semibold text-muted">Sign out</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const { profile, rides, ratings } = state;
  const displayName = profile.name ?? profile.username;
  const bio = profile.bio?.trim() ?? "";
  const ratingAvg = ratings && ratings.count > 0 ? ratings.average.toFixed(1) : "—";
  const ratingCount = ratings?.count ?? 0;

  return (
    <Screen className="px-0">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void reload("refresh")}
            tintColor={resolved === "dark" ? "#F4F4F6" : "#0A0A0A"}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold tracking-tight text-ink">Profile</Text>
          <Pressable onPress={signOut} hitSlop={8} className="py-2">
            <Text className="text-xs font-semibold text-muted">Sign out</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-cream-2">
            <Text className="text-2xl font-semibold text-ink">{initialsFor(displayName)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              @{profile.username}
            </Text>
            {profile.school ? (
              <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                {profile.school}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-2xl border border-line bg-cream-2 px-4 py-3">
          <Stat label="Posts" value={String(rides.length)} />
          <View className="h-8 w-px bg-line" />
          <Stat label="Rating" value={ratingAvg} />
          <View className="h-8 w-px bg-line" />
          <Stat label="Reviews" value={String(ratingCount)} />
        </View>

        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Bio</Text>
          {bio ? (
            <Text className="text-sm leading-5 text-ink-2">{bio}</Text>
          ) : (
            <Text className="text-sm text-muted">No bio yet.</Text>
          )}
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setEditing(true)}
            className="flex-1 items-center rounded-full border border-line bg-cream py-2.5"
          >
            <Text className="text-sm font-semibold text-ink">Edit profile</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Vehicle")}
            className="flex-1 items-center rounded-full border border-line bg-cream py-2.5"
          >
            <Text className="text-sm font-semibold text-ink">
              {vehicle?.make ? "Edit vehicle" : "Add vehicle"}
            </Text>
          </Pressable>
        </View>

        {vehicle?.driverVerified ? (
          <View className="self-start rounded-full bg-sage px-3 py-1">
            <Text className="text-[10px] font-semibold text-white">✓ verified driver</Text>
          </View>
        ) : null}

        <View className="gap-2 border-t border-line pt-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Your posts
          </Text>
          {rides.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-sm text-muted">No posts yet.</Text>
            </View>
          ) : (
            rides.map((r) => (
              <PostRow
                key={r.id}
                post={r}
                onPress={() => navigation.navigate("UpdatePost", { post: r })}
              />
            ))
          )}
        </View>

        {ratings && ratings.count > 0 ? (
          <View className="gap-2 border-t border-line pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Recent reviews
            </Text>
            {ratings.ratings.slice(0, 3).map((r) => (
              <View key={r.id} className="rounded-2xl border border-line bg-cream p-3">
                <Text className="text-xs text-muted">
                  @{r.raterUsername} · {"★".repeat(r.stars)}
                </Text>
                {r.text ? <Text className="text-sm text-ink-2">{r.text}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View className="gap-2 border-t border-line pt-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            Appearance
          </Text>
          <View className="flex-row rounded-full bg-cream-2 p-1">
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setMode(opt.value)}
                  className={`flex-1 items-center rounded-full py-2 ${active ? "bg-ink" : ""}`}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? "text-cream" : "text-muted"}`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable onPress={openBugReport} className="mt-2 border-t border-line pt-4">
          <Text className="text-sm font-semibold text-ink-2">Report an issue / bug →</Text>
          <Text className="text-xs text-muted">Opens a Google Form in your browser.</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Terms")}
          className="border-t border-line pt-4"
        >
          <Text className="text-sm font-semibold text-ink-2">Terms &amp; Conditions →</Text>
          <Text className="text-xs text-muted">
            How we use your information and what you're responsible for.
          </Text>
        </Pressable>
      </ScrollView>

      <EditBioModal
        visible={editing}
        token={token}
        initialBio={profile.bio ?? ""}
        displayName={displayName}
        onClose={() => setEditing(false)}
        onSaved={(updated) => {
          setState({ kind: "ready", profile: updated, rides, ratings });
          setEditing(false);
        }}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-lg font-semibold text-ink">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{label}</Text>
    </View>
  );
}

function PostRow({ post, onPress }: { post: FeedPostResponse; onPress: () => void }) {
  const isPassenger = (post.postType ?? "DRIVER") === "PASSENGER";
  const dot = isPassenger ? "bg-passenger" : "bg-driver";
  const accent = isPassenger ? "text-passenger" : "text-driver";
  const tag = isPassenger ? "Looking" : "Offering";
  const when = new Date(post.departureTime).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-cream p-3"
    >
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-1.5">
          <View className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          <Text className={`text-[10px] font-semibold uppercase tracking-wider ${accent}`}>
            {tag}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
          {post.origin} → {post.destination}
        </Text>
        <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
          {when}
          {!isPassenger
            ? ` · $${post.price.toFixed(0)} · ${post.seats} seat${post.seats === 1 ? "" : "s"}`
            : ""}
        </Text>
      </View>
      <Text className="text-xs font-semibold text-ink">Edit</Text>
    </Pressable>
  );
}

interface EditBioModalProps {
  visible: boolean;
  token: string | null;
  initialBio: string;
  displayName: string;
  onClose: () => void;
  onSaved: (profile: MyProfile) => void;
}

function EditBioModal({
  visible,
  token,
  initialBio,
  displayName,
  onClose,
  onSaved,
}: EditBioModalProps) {
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setBio(initialBio);
      setErr(null);
    }
  }, [visible, initialBio]);

  const save = async () => {
    if (!token) return;
    if (bio.length > BIO_MAX) {
      setErr(`Bio must be ${BIO_MAX} characters or fewer.`);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.profile.updateBio(token, bio.trim());
      onSaved(updated);
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("Couldn't save bio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <EditBioBody
        bio={bio}
        setBio={setBio}
        save={save}
        saving={saving}
        err={err}
        onClose={onClose}
        displayName={displayName}
      />
    </Modal>
  );
}

function EditBioBody({
  bio,
  setBio,
  save,
  saving,
  err,
  onClose,
  displayName,
}: {
  bio: string;
  setBio: (next: string) => void;
  save: () => void;
  saving: boolean;
  err: string | null;
  onClose: () => void;
  displayName: string;
}) {
  const insets = useSafeAreaInsets();
  // iOS pageSheet handles its own top inset; Android fullScreen needs ours.
  const headerTopPad = Platform.OS === "ios" ? 14 : Math.max(insets.top, 12) + 6;

  return (
    <SafeAreaView
      className="flex-1 bg-cream"
      edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="flex-row items-center justify-between border-b border-line px-5 pb-4"
          style={{ paddingTop: headerTopPad }}
        >
          <Pressable onPress={onClose} hitSlop={10} className="min-w-[64px] py-1">
            <Text className="text-sm font-semibold text-muted">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold text-ink">Edit profile</Text>
          <Pressable
            onPress={save}
            disabled={saving}
            hitSlop={10}
            className="min-w-[64px] items-end py-1"
          >
            <Text className={`text-sm font-semibold ${saving ? "text-muted" : "text-ink"}`}>
              {saving ? "Saving…" : "Done"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-2">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-cream-2">
              <Text className="text-2xl font-semibold text-ink">
                {(displayName[0] ?? "?").toUpperCase()}
              </Text>
            </View>
            <Text className="text-xs text-muted">Profile photo coming soon</Text>
          </View>

          {err ? <FormError message={err} /> : null}

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Bio
              </Text>
              <Text className="text-[10px] text-muted">
                {bio.length}/{BIO_MAX}
              </Text>
            </View>
            <TextInput
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
              placeholder="Tell people about yourself"
              placeholderTextColor="#6B7076"
              multiline
              style={{
                minHeight: 120,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E4E4E7",
                backgroundColor: "#FFFFFF",
                color: "#0A0A0A",
                fontSize: 15,
                lineHeight: 21,
                textAlignVertical: "top",
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
