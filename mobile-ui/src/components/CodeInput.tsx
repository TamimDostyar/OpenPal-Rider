/**
 * Four-cell numeric input used for email-verification codes. Auto-advances
 * focus forward on entry and backwards on backspace.
 */
import React, { useRef } from "react";
import { TextInput, View } from "react-native";

interface CodeInputProps {
  value: string;
  onChange: (next: string) => void;
}

const LENGTH = 4;

export function CodeInput({ value, onChange }: CodeInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.split("").concat(Array(LENGTH).fill("")).slice(0, LENGTH);

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join("").trimEnd());
    if (digit && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row gap-2.5">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digit}
          onChangeText={(raw) => setDigit(index, raw)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace") handleBackspace(index);
          }}
          keyboardType="number-pad"
          maxLength={1}
          className={`h-16 flex-1 rounded-2xl border text-center text-2xl font-semibold ${
            digit
              ? "border-ink bg-ink text-cream"
              : "border-line bg-white text-ink"
          }`}
        />
      ))}
    </View>
  );
}
