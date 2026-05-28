/**
 * Root component for the OpenPal Rider app. Wires up safe-area, auth, and
 * the navigation container that drives every screen.
 */
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, Component } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";

import { AuthProvider } from "@/auth/AuthContext";
import { OnboardingProvider } from "@/auth/OnboardingContext";
import { FeedFiltersProvider } from "@/hooks/FeedFiltersContext";
import { AppNavigator } from "@/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import {
  getCurrentPermissionStatus,
  initNotifications,
  requestNotificationPermission,
} from "@/services/notifications";

import "./global.css";

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "red", marginBottom: 12 }}>
            App crashed — tap to copy error
          </Text>
          <ScrollView>
            <Text style={{ fontFamily: "Courier", fontSize: 13, color: "#333" }}>
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Set up the notification handler first — must be done inside useEffect,
    // NOT at module scope, to avoid Hermes crashing in Release builds.
    initNotifications();

    // Prompt for notifications on cold start when the OS has not been asked
    // yet. Subsequent launches rely on the Permissions onboarding screen so
    // we do not pester users who already declined.
    void (async () => {
      try {
        const status = await getCurrentPermissionStatus();
        if (status === "undetermined") {
          await requestNotificationPermission();
        }
      } catch (e) {
        console.warn("Notification permission check failed:", e);
      }
    })();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <OnboardingProvider>
              <FeedFiltersProvider>
                <NavigationContainer>
                  <ThemedStatusBar />
                  <AppNavigator />
                </NavigationContainer>
              </FeedFiltersProvider>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

/** StatusBar text/icons follow the active theme (light glyphs on dark bg). */
function ThemedStatusBar() {
  const { resolved } = useTheme();
  return <StatusBar style={resolved === "dark" ? "light" : "dark"} />;
}
