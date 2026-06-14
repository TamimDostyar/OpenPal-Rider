/**
 * Wraps expo-calendar so we can drop an accepted ride onto the user's
 * iOS/Android calendar with just a permission prompt — no Google OAuth. The
 * event lands on whatever default calendar the device is set up with
 * (iCloud, Google, Exchange, etc.) via Apple's EventKit / Android's
 * CalendarContract.
 *
 * If the user denies calendar access we fall back to a local notification
 * reminder 30 min before departure, so they still get a nudge.
 */
import * as Calendar from "expo-calendar";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type CalendarPermissionStatus = "granted" | "denied" | "undetermined";

export interface RideEventInput {
  title: string;
  origin: string;
  destination: string;
  startIso: string;
  endIso: string;
  notes?: string;
}

export type AddRideResult =
  | { kind: "calendar"; eventId: string }
  | { kind: "reminder"; notificationId: string }
  | { kind: "skipped"; reason: string };

export async function getCalendarPermissionStatus(): Promise<CalendarPermissionStatus> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status as CalendarPermissionStatus;
}

export async function requestCalendarPermission(): Promise<CalendarPermissionStatus> {
  const existing = await Calendar.getCalendarPermissionsAsync();
  if (existing.status === "granted") return "granted";
  const next = await Calendar.requestCalendarPermissionsAsync();
  return next.status as CalendarPermissionStatus;
}

async function pickDefaultCalendarId(): Promise<string | null> {
  if (Platform.OS === "ios") {
    const def = await Calendar.getDefaultCalendarAsync();
    if (def?.id) return def.id;
  }
  // Android (and iOS fallback): pick the first writable calendar.
  const all = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = all.find(
    (c) => c.allowsModifications && c.accessLevel !== Calendar.CalendarAccessLevel.READ,
  );
  return writable?.id ?? all[0]?.id ?? null;
}

/**
 * Schedules a one-shot local notification 30 min before the ride starts.
 * Used when calendar permission has been denied — at least the user gets a
 * nudge so they don't miss the trip.
 */
async function scheduleRideReminder(input: RideEventInput): Promise<string | null> {
  const start = new Date(input.startIso).getTime();
  const fireAt = new Date(start - 30 * 60 * 1000);
  if (Number.isNaN(fireAt.getTime()) || fireAt.getTime() <= Date.now()) {
    return null;
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: `${input.origin} → ${input.destination}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
}

/**
 * Adds an accepted ride to the user's calendar. If calendar permission is
 * not granted, falls back to a local notification reminder 30 min before
 * departure.
 */
export async function addRideToCalendar(input: RideEventInput): Promise<AddRideResult> {
  const status = await requestCalendarPermission();
  if (status !== "granted") {
    const notificationId = await scheduleRideReminder(input);
    if (notificationId) return { kind: "reminder", notificationId };
    return { kind: "skipped", reason: "calendar denied and ride is in the past" };
  }

  const calendarId = await pickDefaultCalendarId();
  if (!calendarId) {
    const notificationId = await scheduleRideReminder(input);
    if (notificationId) return { kind: "reminder", notificationId };
    return { kind: "skipped", reason: "no writable calendar on device" };
  }

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: input.title,
    startDate: new Date(input.startIso),
    endDate: new Date(input.endIso),
    location: `${input.origin} → ${input.destination}`,
    notes: input.notes,
    alarms: [{ relativeOffset: -30 }],
  });
  return { kind: "calendar", eventId };
}
