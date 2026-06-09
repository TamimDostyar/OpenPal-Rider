import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";

import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/auth/AuthContext";
import { useOnboarding } from "@/auth/OnboardingContext";
import { AuthedTabsScreen } from "@/screens/AuthedTabsScreen";
import { PermissionsScreen } from "@/screens/PermissionsScreen";
import { CampusUtilityScreen } from "@/screens/CampusUtilityScreen";
import { ConversationScreen } from "@/screens/ConversationScreen";
import { CreatePostScreen } from "@/screens/CreatePostScreen";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { PostDetailScreen } from "@/screens/PostDetailScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";
import { RateRideScreen } from "@/screens/RateRideScreen";
import { ReportScreen } from "@/screens/ReportScreen";
import { ResetPasswordScreen } from "@/screens/ResetPasswordScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { TermsScreen } from "@/screens/TermsScreen";
import { UpdatePostScreen } from "@/screens/UpdatePostScreen";
import { UserProfileScreen } from "@/screens/UserProfileScreen";
import { VehicleScreen } from "@/screens/VehicleScreen";
import { VerifyEmailScreen } from "@/screens/VerifyEmailScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";

import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { token, loading } = useAuth();
  const { onboarded, loading: onboardingLoading } = useOnboarding();
  const { colorScheme } = useColorScheme();

  if (loading || onboardingLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <Spinner />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Matches --c-cream so screen transitions don't flash the wrong color.
        contentStyle: { backgroundColor: colorScheme === "dark" ? "#121214" : "#FFFFFF" },
      }}
    >
      {token ? (
        onboarded ? (
        <>
          <Stack.Screen name="AuthedTabs" component={AuthedTabsScreen} />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="UpdatePost"
            component={UpdatePostScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="CampusUtility"
            component={CampusUtilityScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen
            name="RateRide"
            component={RateRideScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Vehicle"
            component={VehicleScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: "modal" }}
          />
        </>
        ) : (
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
        )
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
