/**
 * Typed date entry (MM/DD/YYYY). The typed value is parsed, validated against
 * any min/max bounds, and stored as a YYYY-MM-DD string — the shape the backend
 * expects — so callers never deal with the display format.
 */
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// "2001-09-04" -> "09/04/2001" for display in the text input.
function isoToDisplay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "";
}

// Format raw keystrokes into MM/DD/YYYY as the user types.
function digitsToDisplay(digits: string): string {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Parse a complete MM/DD/YYYY string into an ISO date, or null if it isn't a
// real calendar date or falls outside the allowed range.
function displayToIso(display: string, min?: Date, max?: Date): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;
  const date = new Date(year, month - 1, day);
  // Rejects rollovers like 02/30 (which JS would otherwise shift to March).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  const day0 = startOfDay(date);
  if (min && day0 < startOfDay(min)) return null;
  if (max && day0 > startOfDay(max)) return null;
  return toIsoDate(date);
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  hint,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const [text, setText] = useState<string>(() => isoToDisplay(value));
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Keep the visible text in sync when the value changes from the outside,
  // but never fight the user mid-type.
  useEffect(() => {
    if (!focused) {
      setText(isoToDisplay(value));
      setInvalid(false);
    }
  }, [value, focused]);

  const handleType = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const display = digitsToDisplay(digits);
    setText(display);

    if (digits.length === 8) {
      const iso = displayToIso(display, minimumDate, maximumDate);
      setInvalid(iso === null);
      onChange(iso ?? "");
    } else {
      setInvalid(false);
      if (value) onChange("");
    }
  };

  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <TextInput
        value={text}
        onChangeText={handleType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#6B7076"
        keyboardType="number-pad"
        maxLength={10}
        className={`h-14 rounded-2xl border bg-cream px-4 text-base text-ink ${
          invalid ? "border-coral" : "border-line"
        }`}
      />
      {invalid ? (
        <Text className="mt-1.5 text-xs text-coral">Enter a valid date (MM/DD/YYYY).</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
