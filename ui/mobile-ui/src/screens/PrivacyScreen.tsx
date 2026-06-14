/**
 * Read-only Privacy Policy document. Presented as a modal from the signup flow,
 * the login screen, and Settings so the copy is always available. Apple
 * (guideline 5.1.1) requires a dedicated, in-app privacy policy.
 */
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LegalDocumentView } from "@/components/LegalDocumentView";
import { PRIVACY_FALLBACK } from "@/components/PrivacyContent";
import { useLegalDocument } from "@/hooks/useLegalDocument";

export function PrivacyScreen() {
  const navigation = useNavigation();
  const { doc } = useLegalDocument("privacy", PRIVACY_FALLBACK);
  const insets = useSafeAreaInsets();
  // iOS pageSheet handles its own top inset; Android fullScreen needs ours.
  const headerTopPad = Platform.OS === "ios" ? 14 : Math.max(insets.top, 12) + 6;

  return (
    <SafeAreaView
      className="flex-1 bg-cream"
      edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
    >
      <View
        className="flex-row items-center justify-between border-b border-line px-5 pb-4"
        style={{ paddingTop: headerTopPad }}
      >
        <View className="min-w-[64px]" />
        <Text className="text-base font-semibold text-ink">Privacy Policy</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          className="min-w-[64px] items-end py-1"
        >
          <Text className="text-sm font-semibold text-ink">Done</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LegalDocumentView doc={doc} />
      </ScrollView>
    </SafeAreaView>
  );
}
