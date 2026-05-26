/**
 * Form state and submission logic for the create-post screen. Validates the
 * ride fields locally and signs the user out if the backend reports the token is stale.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useCreatePost() {
  const navigation = useNavigation<Nav>();
  const { token, signOut } = useAuth();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [postType, setPostType] = useState<"DRIVER" | "PASSENGER">("DRIVER");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("1");
  const [departureTime, setDepartureTime] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!token) {
      setError("You're signed out — log in to post.");
      return;
    }
    if (!origin.trim()) return setError("Where are you leaving from?");
    if (!destination.trim()) return setError("Where are you going?");
    if (!departureTime) {
      return setError("Pick when the ride leaves.");
    }

    const isDriver = postType === "DRIVER";
    let priceNum = 0;
    let seatsNum = 1;
    if (isDriver) {
      priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return setError("Enter a valid price (e.g. 25 or 25.50).");
      }
      seatsNum = Number.parseInt(seats, 10);
      if (!Number.isFinite(seatsNum) || seatsNum < 1) {
        return setError("Seats must be at least 1.");
      }
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.feed.create(token, {
        postType,
        origin: origin.trim(),
        destination: destination.trim(),
        price: priceNum,
        seats: seatsNum,
        departureTime,
        vehicleInfo: isDriver ? vehicleInfo.trim() || undefined : undefined,
        description: description.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          await signOut();
          return;
        }
        setError(err.message);
      } else {
        setError("Couldn't create the post.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
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
    cancel: () => navigation.goBack(),
  };
}
