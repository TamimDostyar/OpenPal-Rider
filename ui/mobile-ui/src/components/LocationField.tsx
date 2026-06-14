/**
 * Labeled location input with OpenStreetMap autocomplete. As the user types,
 * it debounces and queries Nominatim (see services/geocode), showing a dropdown
 * of real places. Selecting one reports the place — with coordinates — so the
 * post can render a route map.
 *
 * Free typing is preserved: if the user never picks a suggestion, the typed
 * text is still surfaced via onChangeText as the origin/destination string,
 * just without coordinates.
 */
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { searchPlaces, type GeocodePlace } from "@/services/geocode";

interface LocationFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSelect: (place: GeocodePlace) => void;
}

export function LocationField({
  label,
  value,
  placeholder,
  onChangeText,
  onSelect,
}: LocationFieldProps) {
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // True right after a selection so the resulting setValue doesn't re-trigger a
  // search and reopen the dropdown.
  const justSelected = useRef(false);

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      const places = await searchPlaces(q, controller.signal);
      if (!controller.signal.aborted) {
        setResults(places);
        setOpen(true);
        setLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  const choose = (place: GeocodePlace) => {
    justSelected.current = true;
    onChangeText(place.label);
    onSelect(place);
    setOpen(false);
    setResults([]);
  };

  return (
    // While the dropdown is open this field must stack above the fields below
    // it; zIndex + Android elevation are both required for that AND for the
    // overlay to receive touches.
    <View className="relative" style={{ zIndex: open ? 50 : 1, elevation: open ? 50 : 0 }}>
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </Text>
      <View className="flex-row items-center rounded-2xl border border-line bg-cream pr-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          placeholderTextColor="#6B7076"
          autoCapitalize="words"
          autoCorrect={false}
          className="h-14 flex-1 px-4 text-base text-ink"
        />
        {loading ? <ActivityIndicator color="#6B7076" size="small" /> : null}
      </View>

      {open && results.length > 0 ? (
        <View
          className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-2xl border border-line bg-cream"
          style={{
            zIndex: 50,
            elevation: 12,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          {results.map((place, idx) => (
            <Pressable
              key={place.placeId}
              onPress={() => choose(place)}
              android_ripple={{ color: "#EEEEF1" }}
              className={`min-h-[56px] flex-row items-center gap-3 px-4 py-3.5 active:bg-cream-2 ${
                idx > 0 ? "border-t border-line-2" : ""
              }`}
            >
              <Text className="text-lg">📍</Text>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                  {place.label}
                </Text>
                {place.detail ? (
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {place.detail}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
