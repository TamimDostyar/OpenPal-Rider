import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DateTimeField } from "@/components/DateTimeField";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useCreatePost } from "@/hooks/useCreatePost";

export function CreatePostScreen() {
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    price,
    setPrice,
    seats,
    setSeats,
    departureTime,
    setDepartureTime,
    vehicleInfo,
    setVehicleInfo,
    description,
    setDescription,
    error,
    submitting,
    submit,
    cancel,
  } = useCreatePost();

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable onPress={cancel} className="py-2">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">New ride</Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormError message={error} />

        <TextField
          label="From"
          value={origin}
          onChangeText={setOrigin}
          placeholder="MSP"
          autoCapitalize="words"
        />
        <TextField
          label="To"
          value={destination}
          onChangeText={setDestination}
          placeholder="Colorado"
          autoCapitalize="words"
        />

        <DateTimeField
          label="Departure"
          value={departureTime}
          onChange={setDepartureTime}
          minimumDate={new Date()}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Price (USD)"
              value={price}
              onChangeText={setPrice}
              placeholder="25"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Seats"
              value={seats}
              onChangeText={setSeats}
              placeholder="3"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TextField
          label="Vehicle (optional)"
          value={vehicleInfo}
          onChangeText={setVehicleInfo}
          placeholder="Silver Toyota Camry"
        />

        <TextField
          label="Notes (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Leaving early, one stop for gas"
          multiline
        />

        <View className="pt-2">
          <Button label="Post ride" onPress={submit} loading={submitting} />
        </View>
      </ScrollView>
    </Screen>
  );
}
