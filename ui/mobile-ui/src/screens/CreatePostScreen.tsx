/**
 * Modal form for composing a new ride post. Validates inputs locally and
 * delegates submission to the useCreatePost hook.
 */
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DateTimeField } from "@/components/DateTimeField";
import { FormError } from "@/components/FormError";
import { LocationField } from "@/components/LocationField";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useCreatePost } from "@/hooks/useCreatePost";

export function CreatePostScreen() {
  const {
    origin,
    setOrigin,
    selectOrigin,
    destination,
    setDestination,
    selectDestination,
    postType,
    setPostType,
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

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
            What are you posting?
          </Text>
          <View className="flex-row rounded-full bg-cream-2 p-1">
            <Pressable
              onPress={() => setPostType("DRIVER")}
              className={`flex-1 items-center rounded-full py-2 ${
                postType === "DRIVER" ? "bg-driver" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  postType === "DRIVER" ? "text-white" : "text-muted"
                }`}
              >
                Offering a ride
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPostType("PASSENGER")}
              className={`flex-1 items-center rounded-full py-2 ${
                postType === "PASSENGER" ? "bg-passenger" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  postType === "PASSENGER" ? "text-white" : "text-muted"
                }`}
              >
                Looking for a ride
              </Text>
            </Pressable>
          </View>
          <Text className="text-[11px] text-muted">
            {postType === "DRIVER"
              ? "You're driving and have seats to share."
              : "You need a ride from someone driving."}
          </Text>
        </View>

        <LocationField
          label="From"
          value={origin}
          onChangeText={setOrigin}
          onSelect={selectOrigin}
          placeholder="Search a place, e.g. Minneapolis"
        />
        <LocationField
          label="To"
          value={destination}
          onChangeText={setDestination}
          onSelect={selectDestination}
          placeholder="Search a place, e.g. Denver"
        />

        <DateTimeField
          label="Departure"
          value={departureTime}
          onChange={setDepartureTime}
          minimumDate={new Date()}
        />

        {postType === "DRIVER" ? (
          <>
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
          </>
        ) : null}

        <TextField
          label="Notes (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Leaving early, one stop for gas"
          multiline
        />

        <View className="pt-2">
          <Button
            label={postType === "DRIVER" ? "Post ride offer" : "Post ride request"}
            onPress={submit}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
