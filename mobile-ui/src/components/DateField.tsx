/**
 * Calendar date picker rendered inline on Android and inside a bottom-sheet
 * modal on iOS. Stores the selected value as a YYYY-MM-DD string.
 */
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

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

export function DateField({
  label,
  value,
  onChange,
  placeholder = "Select a date",
  hint,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => toDate(value));

  const openPicker = () => {
    setDraft(toDate(value));
    setOpen(true);
  };

  const handleChange = (event: DateTimePickerEvent, picked?: Date) => {
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
      onChange={handleChange}
      accentColor={ACCENT}
      themeVariant="light"
    />
  );

  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <Pressable
        onPress={openPicker}
        className="h-14 justify-center rounded-2xl border border-line bg-cream px-4"
      >
        <Text className={`text-base ${value ? "text-ink" : "text-muted"}`}>
          {value || placeholder}
        </Text>
      </Pressable>
      {hint ? <Text className="mt-1.5 text-xs text-muted">{hint}</Text> : null}

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
