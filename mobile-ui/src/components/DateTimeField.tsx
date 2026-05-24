import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

interface DateTimeFieldProps {
  label: string;
  // ISO LocalDateTime: YYYY-MM-DDTHH:mm:ss (no zone — backend stores wall-clock)
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  minimumDate?: Date;
}

const ACCENT = "#FF5B43";

function toDate(value: string): Date {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toIsoLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
}

function display(value: string): string {
  if (!value) return "";
  const d = toDate(value);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DateTimeField({
  label,
  value,
  onChange,
  placeholder = "Pick a date and time",
  hint,
  minimumDate,
}: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => toDate(value));
  // Android shows date first, then time. iOS uses one combined picker.
  const [androidStage, setAndroidStage] = useState<"date" | "time">("date");

  const openPicker = () => {
    setDraft(toDate(value));
    setAndroidStage("date");
    setOpen(true);
  };

  const handleChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === "ios") {
      if (picked) setDraft(picked);
      return;
    }
    if (event.type !== "set" || !picked) {
      setOpen(false);
      return;
    }
    if (androidStage === "date") {
      const next = new Date(draft);
      next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
      setDraft(next);
      setAndroidStage("time");
    } else {
      const next = new Date(draft);
      next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
      onChange(toIsoLocal(next));
      setOpen(false);
    }
  };

  const confirmIos = () => {
    onChange(toIsoLocal(draft));
    setOpen(false);
  };

  const renderPicker = () => {
    if (Platform.OS === "ios") {
      return (
        <DateTimePicker
          value={draft}
          mode="datetime"
          display="inline"
          minimumDate={minimumDate}
          onChange={handleChange}
          accentColor={ACCENT}
          themeVariant="light"
        />
      );
    }
    return (
      <DateTimePicker
        value={draft}
        mode={androidStage}
        display="default"
        minimumDate={minimumDate}
        onChange={handleChange}
      />
    );
  };

  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <Pressable
        onPress={openPicker}
        className="h-14 justify-center rounded-2xl border border-line bg-white px-4"
      >
        <Text className={`text-base ${value ? "text-ink" : "text-muted"}`}>
          {value ? display(value) : placeholder}
        </Text>
      </Pressable>
      {hint ? <Text className="mt-1.5 text-xs text-muted">{hint}</Text> : null}

      {open && Platform.OS !== "ios" ? renderPicker() : null}
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
              {renderPicker()}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
