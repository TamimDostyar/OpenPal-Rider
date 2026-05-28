/**
 * Wraps expo-notifications so the rest of the app can ask "are we allowed to
 * notify this user?" and "give me the Expo push token to send to the backend"
 * without touching the platform APIs directly. Push delivery itself is wired
 * up server-side in a follow-up phase.
 */
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "openpal.rider.pushToken";
const ANDROID_CHANNEL_ID = "default";

/**
 * Must be called once during app initialisation (inside a useEffect in the
 * root component). Deliberately NOT called at module scope because Hermes
 * executes module-level code before the React Native bridge is fully ready
 * in Release builds, which causes a silent white-screen crash.
 */
export function initNotifications(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn("initNotifications failed:", e);
  }
}

export type PermissionStatus = "granted" | "denied" | "undetermined";

export interface PermissionResult {
  status: PermissionStatus;
  pushToken: string | null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#FFFFFF",
  });
}

function projectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
      ?.projectId
  );
}

export async function getStoredPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function getCurrentPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Asks the OS for notification permission (no-op if already decided), then
 * fetches and caches the Expo push token when granted. Safe to call on
 * simulators — those just return a denied/null result.
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let finalStatus = existing.status as PermissionStatus;
  if (finalStatus !== "granted") {
    const next = await Notifications.requestPermissionsAsync();
    finalStatus = next.status as PermissionStatus;
  }

  if (finalStatus !== "granted" || !Device.isDevice) {
    return { status: finalStatus, pushToken: null };
  }

  const id = projectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    id ? { projectId: id } : undefined,
  );
  const pushToken = tokenResponse.data;
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, pushToken);
  return { status: finalStatus, pushToken };
}
