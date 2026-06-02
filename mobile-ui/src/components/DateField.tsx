/**
 * Date entry that you can either type (MM/DD/YYYY) or pick from a calendar.
 * The typed value is parsed, validated against any min/max bounds, and stored
 * as a YYYY-MM-DD string — the same shape the calendar picker produces, so
 * callers don't care which input the user used. The calendar opens inline on
 * Android and inside a bottom-sheet modal on iOS.
 */
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, TextInput, View } from "react-native";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}
const ACCENT = "#0A0A0A";

function toDate(value: string): Date {
  const parsed = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => toDate(value));
  const [text, setText] = useState<string>(() => isoToDisplay(value));
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Keep the visible text in sync when the value changes from the outside
  // (e.g. the calendar picker), but never fight the user mid-type.
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

  const openPicker = () => {
    setDraft(toDate(value));
    setOpen(true);
  };

  const handlePickerChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === "ios") {
      if (picked) setDraft(picked);
      return;
    }
    setOpen(false);
    if (event.type === "set" && picked) onChange(toIsoDate(picked));
  };

  const confirmIos = () => {
    onChange(toIsoDate(draft));
    setOpen(false);
  };

  const picker = (
    <DateTimePicker
      value={Platform.OS === "ios" ? draft : toDate(value)}
      mode="date"
      display={Platform.OS === "ios" ? "inline" : "default"}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      onChange={handlePickerChange}
      accentColor={ACCENT}
      themeVariant="light"
    />
  );

  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <View
        className={`h-14 flex-row items-center rounded-2xl border bg-cream pl-4 pr-2 ${
          invalid ? "border-coral" : "border-line"
        }`}
      >
        <TextInput
          value={text}
          onChangeText={handleType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#6B7076"
          keyboardType="number-pad"
          maxLength={10}
          className="flex-1 text-base text-ink"
        />
        <Pressable
          onPress={openPicker}
          hitSlop={8}
          accessibilityLabel="Open calendar"
          className="h-10 w-10 items-center justify-center rounded-xl"
        >
          <Text className="text-lg">📅</Text>
        </Pressable>
      </View>
      {invalid ? (
        <Text className="mt-1.5 text-xs text-coral">Enter a valid date (MM/DD/YYYY).</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted">{hint}</Text>
      ) : null}

      {open && Platform.OS !== "ios" ? picker : null}
      {Platform.OS === "ios" ? (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-ink/40"
            onPress={() => setOpen(false)}
          >
            <Pressable className="rounded-t-3xl bg-cream px-5 pb-8 pt-4">
              <View className="mb-1 flex-row justify-end">
                <Pressable onPress={confirmIos} className="px-2 py-1">
                  <Text className="text-base font-semibold text-coral-dk">
                    Done
                  </Text>
                </Pressable>
              </View>
              {picker}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
