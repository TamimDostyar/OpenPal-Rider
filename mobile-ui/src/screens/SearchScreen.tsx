import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { FeedSearchParams } from "@/api/types";
import { Button } from "@/components/Button";
import { DateTimeField } from "@/components/DateTimeField";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useFeedFilters } from "@/hooks/FeedFiltersContext";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { filters, setFilters } = useFeedFilters();

  const [destination, setDestination] = useState(filters?.destination ?? "");
  const [dateFrom, setDateFrom] = useState(filters?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters?.dateTo ?? "");
  const [maxPrice, setMaxPrice] = useState(
    filters?.maxPrice !== undefined ? String(filters.maxPrice) : "",
  );
  const [minSeats, setMinSeats] = useState(
    filters?.minSeats !== undefined ? String(filters.minSeats) : "",
  );

  const apply = () => {
    const params: FeedSearchParams = {};
    if (destination.trim()) params.destination = destination.trim();
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const priceNum = Number(maxPrice);
    if (Number.isFinite(priceNum) && priceNum > 0) params.maxPrice = priceNum;
    const seatsNum = Number.parseInt(minSeats, 10);
    if (Number.isFinite(seatsNum) && seatsNum > 0) params.minSeats = seatsNum;

    setFilters(Object.keys(params).length === 0 ? null : params);
    navigation.goBack();
  };

  const clear = () => {
    setFilters(null);
    navigation.goBack();
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} className="py-2">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">Search rides</Text>
        <Pressable onPress={clear} className="py-2">
          <Text className="text-sm font-semibold text-coral-dk">Clear</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Destination contains"
          value={destination}
          onChangeText={setDestination}
          placeholder="Denver"
          autoCapitalize="words"
        />

        <DateTimeField
          label="Earliest departure"
          value={dateFrom}
          onChange={setDateFrom}
        />
        <DateTimeField
          label="Latest departure"
          value={dateTo}
          onChange={setDateTo}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Max price"
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="30"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Min seats"
              value={minSeats}
              onChangeText={setMinSeats}
              placeholder="1"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View className="pt-2">
          <Button label="Apply filters" onPress={apply} />
        </View>
      </ScrollView>
    </Screen>
  );
}
