/**
 * School picker that opens a full-screen modal with a searchable university list.
 * Delegates fetching and filtering to the caller via the schools/query props.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { University } from "@/api/types";

interface SchoolFieldProps {
  label: string;
  value: string;
  onChange: (school: string) => void;
  schools: University[];
  loading: boolean;
  error: string | null;
  query: string;
  onQueryChange: (next: string) => void;
  hint?: string;
}

export function SchoolField({
  label,
  value,
  onChange,
  schools,
  loading,
  error,
  query,
  onQueryChange,
  hint,
}: SchoolFieldProps) {
  const [open, setOpen] = useState(false);

  const select = (school: string) => {
    onChange(school);
    onQueryChange("");
    setOpen(false);
  };

  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center justify-between rounded-2xl border border-line bg-cream px-4"
      >
        <Text className={`text-base ${value ? "text-ink" : "text-muted"}`}>
          {value || "Select your school"}
        </Text>
        <Text className="text-base text-muted">▾</Text>
      </Pressable>
      {hint ? <Text className="mt-1.5 text-xs text-muted">{hint}</Text> : null}

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-cream">
          <View className="flex-1 px-6">
            <View className="flex-row items-center gap-1 py-3">
              <Pressable
                onPress={() => setOpen(false)}
                className="-ml-2 p-2"
                hitSlop={8}
              >
                <Text className="text-2xl leading-none text-ink">‹</Text>
              </Pressable>
              <Text className="text-xl font-semibold text-ink">
                Choose your school
              </Text>
            </View>

            <TextInput
              value={query}
              onChangeText={onQueryChange}
              placeholder="Search universities"
              placeholderTextColor="#6B7076"
              autoCapitalize="words"
              className="h-12 rounded-2xl border border-line bg-cream px-4 text-base text-ink"
            />

            {loading ? (
              <ActivityIndicator className="mt-8" color="#0A0A0A" />
            ) : error ? (
              <Text className="mt-8 text-center text-sm text-coral-dk">
                {error}
              </Text>
            ) : (
              <FlatList
                data={schools}
                keyExtractor={(school) => school.name}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                className="mt-2"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => select(item.name)}
                    className="border-b border-line-2 py-3.5"
                  >
                    <Text
                      className={`text-base ${
                        item.name === value
                          ? "font-semibold text-coral-dk"
                          : "text-ink"
                      }`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text className="mt-8 text-center text-sm text-muted">
                    No schools match your search.
                  </Text>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
