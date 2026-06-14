/**
 * Renders a legal document (Terms or Privacy) fetched from the backend. The
 * shape is shared by both so updating the copy is a backend-only change — no
 * app update required. A bundled fallback is rendered when the fetch fails.
 */
import React from "react";
import { Text, View } from "react-native";

import type { LegalDocument } from "@/api/types";

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold tracking-tight text-ink">{doc.title}</Text>
        {doc.lastUpdated ? (
          <Text className="text-xs text-muted">Last updated {doc.lastUpdated}</Text>
        ) : null}
      </View>

      {doc.intro ? (
        <Text className="text-sm leading-6 text-ink-2">{doc.intro}</Text>
      ) : null}

      {doc.sections.map((section) => (
        <View key={section.title} className="gap-1.5">
          <Text className="text-base font-semibold text-ink">{section.title}</Text>
          <Text className="text-sm leading-6 text-ink-2">{section.body}</Text>
        </View>
      ))}

      {doc.footer ? (
        <Text className="text-xs leading-5 text-muted">{doc.footer}</Text>
      ) : null}
    </View>
  );
}
