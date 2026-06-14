/**
 * Navigation helpers for the welcome screen. Exposes shortcuts for routing
 * into the signup or login flow.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useWelcome() {
  const navigation = useNavigation<Nav>();

  return {
    goToSignup: () => navigation.navigate("Signup"),
    goToLogin: () => navigation.navigate("Login"),
  };
}
