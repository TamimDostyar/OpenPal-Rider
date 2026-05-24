/**
 * Labeled text input styled to match the app's form aesthetic. Forwards any
 * TextInputProps so callers can configure keyboard, secure entry, hints, etc.
 */
import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, ...inputProps }: TextFieldProps) {
  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#8A8378"
        className="h-14 rounded-2xl border border-line bg-white px-4 text-base text-ink"
        {...inputProps}
      />
      {hint ? <Text className="mt-1.5 text-xs text-muted">{hint}</Text> : null}
    </View>
  );
}
