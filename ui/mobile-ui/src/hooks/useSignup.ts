/**
 * Form state and submission logic for the signup screen. Validates required
 * fields locally before calling the backend and routing to email verification.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import type { RootStackParamList } from "@/navigation/types";

import { useUniversities } from "./useUniversities";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useSignup() {
  const navigation = useNavigation<Nav>();
  const universities = useUniversities();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [otherSchool, setOtherSchool] = useState(false);
  const [graduationDate, setGraduationDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const chooseOtherSchool = () => {
    setOtherSchool(true);
    setSchool("");
  };
  const chooseSchoolFromList = () => {
    setOtherSchool(false);
    setSchool("");
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Enter your full name.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!email.endsWith(".edu")) return "Only education email - provide an email that ends with .edu please!";
    
    if (otherSchool) {
      if (!school.trim()) return "Enter your school's name.";
    } else if (!school.trim()) {
      return "Pick your school from the list.";
    }
    if (!/^\d{10}$/.test(phoneNumber)) return "Phone number must be 10 digits.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await api.createUser({
        name: name.trim(),
        email: email.trim(),
        school: school.trim(),
        graduationDate: graduationDate.trim() ? graduationDate : undefined,
        phoneNumber: Number(phoneNumber),
        password,
      });
      navigation.navigate("VerifyEmail", { email: res.email });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    fields: {
      name,
      email,
      school,
      graduationDate,
      phoneNumber,
      password,
    },
    setName,
    setEmail,
    setSchool,
    setGraduationDate,
    setPhoneNumber,
    setPassword,
    otherSchool,
    chooseOtherSchool,
    chooseSchoolFromList,
    universities,
    error,
    submitting,
    submit,
    goBack: () => navigation.goBack(),
  };
}
