/**
 * Post-sign-in onboarding step that asks the user to enable push
 * notifications and grant calendar access. Both are optional — "Skip for
 * now" still flips the onboarded flag so the user is not nagged on every
 * cold start. If calendar access is denied later at booking-accept time,
 * the calendar service falls back to a local notification reminder.
 */
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboarding } from "@/auth/OnboardingContext";
import { Button } from "@/components/Button";
import {
  getCalendarPermissionStatus,
  requestCalendarPermission,
  type CalendarPermissionStatus,
} from "@/services/calendar";
import {
  requestNotificationPermission,
  type PermissionStatus,
} from "@/services/notifications";

type NotifState = "idle" | "pending" | PermissionStatus;
type CalState = "idle" | "pending" | CalendarPermissionStatus;

export function PermissionsScreen() {
  const { markOnboarded } = useOnboarding();
  const [notifState, setNotifState] = useState<NotifState>("idle");
  const [calState, setCalState] = useState<CalState>("idle");
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    getCalendarPermissionStatus().then((s) => setCalState(s));
  }, []);

  const askNotifications = async () => {
    setNotifState("pending");
    const result = await requestNotificationPermission();
    setNotifState(result.status);
  };

  const askCalendar = async () => {
    setCalState("pending");
    const status = await requestCalendarPermission();
    setCalState(status);
  };

  const finish = async () => {
    setFinishing(true);
    await markOnboarded();
  };

  const notifLabel =
    notifState === "granted"
      ? "Notifications enabled"
      : notifState === "denied"
        ? "Notifications blocked — enable in Settings"
        : "Allow notifications";

  const calendarLabel =
    calState === "granted"
      ? "Calendar connected"
      : calState === "denied"
        ? "Calendar blocked — we'll send reminders instead"
        : "Add rides to your calendar";

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-between px-6 py-8">
        <View>
          <Text className="mb-3 text-xs uppercase tracking-widest text-muted">
            One last thing
          </Text>
          <Text className="mb-3 text-4xl font-semibold leading-tight text-ink">
            Stay in the loop on your rides.
          </Text>
          <Text className="text-base leading-relaxed text-muted">
            We use notifications to ping you about new posts, messages, and
            booking updates. Allow calendar access and accepted rides drop
            straight onto your schedule — otherwise we'll send a reminder
            before the trip.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            label={notifLabel}
            onPress={askNotifications}
            variant={notifState === "granted" ? "sage" : "ink"}
            loading={notifState === "pending"}
            disabled={notifState === "granted"}
          />
          <Button
            label={calendarLabel}
            onPress={askCalendar}
            variant={calState === "granted" ? "sage" : "coral"}
            loading={calState === "pending"}
            disabled={calState === "granted"}
          />
        </View>

        <View className="gap-3">
          <Button label="Continue" onPress={finish} loading={finishing} />
          <Pressable onPress={finish} className="py-2">
            <Text className="text-center text-sm text-muted">Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
