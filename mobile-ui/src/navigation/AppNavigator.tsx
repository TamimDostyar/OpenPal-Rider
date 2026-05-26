import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import { AuthedTabsScreen } from "@/screens/AuthedTabsScreen";
import { ConversationScreen } from "@/screens/ConversationScreen";
import { CreatePostScreen } from "@/screens/CreatePostScreen";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { RateRideScreen } from "@/screens/RateRideScreen";
import { ReportScreen } from "@/screens/ReportScreen";
import { ResetPasswordScreen } from "@/screens/ResetPasswordScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { UpdatePostScreen } from "@/screens/UpdatePostScreen";
import { VehicleScreen } from "@/screens/VehicleScreen";
import { VerifyEmailScreen } from "@/screens/VerifyEmailScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";

import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#0A0A0A" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      {token ? (
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
            name="Search"
            component={SearchScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
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
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
