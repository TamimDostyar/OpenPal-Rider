import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useVehicle } from "@/hooks/useVehicle";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VehicleScreen() {
  const navigation = useNavigation<Nav>();
  const { info, loading, saving, error, save } = useVehicle();

  const [licensePlate, setLicensePlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (info) {
      setLicensePlate(info.licensePlate ?? "");
      setMake(info.make ?? "");
      setModel(info.model ?? "");
      setColor(info.color ?? "");
    }
  }, [info]);

  const onSave = async () => {
    if (!licensePlate.trim() || !make.trim() || !model.trim() || !color.trim()) {
      setLocalError("Fill in all four fields.");
      return;
    }
    setLocalError(null);
    const ok = await save({
      licensePlate: licensePlate.trim(),
      make: make.trim(),
      model: model.trim(),
      color: color.trim(),
    });
    if (ok) navigation.goBack();
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable onPress={() => navigation.goBack()} className="py-2">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-ink">Vehicle</Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormError message={localError ?? error} />

        <Text className="text-sm text-ink-2">
          Adding your vehicle shows a “Vehicle on file” note on your posts so
          riders know what to look for. These details are self-reported and are
          not verified by OpenPal.
        </Text>

        <TextField
          label="License plate"
          value={licensePlate}
          onChangeText={setLicensePlate}
          placeholder="ABC-1234"
          autoCapitalize="characters"
          editable={!loading}
        />
        <TextField
          label="Make"
          value={make}
          onChangeText={setMake}
          placeholder="Toyota"
          autoCapitalize="words"
          editable={!loading}
        />
        <TextField
          label="Model"
          value={model}
          onChangeText={setModel}
          placeholder="Camry"
          autoCapitalize="words"
          editable={!loading}
        />
        <TextField
          label="Color"
          value={color}
          onChangeText={setColor}
          placeholder="Silver"
          autoCapitalize="words"
          editable={!loading}
        />

        <View className="pt-2">
          <Button label="Save vehicle" onPress={onSave} loading={saving} />
        </View>

        {info?.driverVerified ? (
          <Text className="pt-1 text-center text-xs text-sage">
            Vehicle on file
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
