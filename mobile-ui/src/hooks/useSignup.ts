import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";

import { ApiError, api } from "@/api/client";
import type { RootStackParamList } from "@/navigation/types";

import { useUniversities } from "./useUniversities";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function useSignup() {
  const navigation = useNavigation<Nav>();
  const universities = useUniversities();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [school, setSchool] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return "Enter your full name.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!DATE_PATTERN.test(dob)) return "Date of birth must be YYYY-MM-DD.";
    if (!school.trim()) return "Pick your school from the list.";
    if (!DATE_PATTERN.test(graduationDate))
      return "Graduation date must be YYYY-MM-DD.";
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
        dob,
        school: school.trim(),
        graduationDate,
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
      dob,
      school,
      graduationDate,
      phoneNumber,
      password,
    },
    setName,
    setEmail,
    setDob,
    setSchool,
    setGraduationDate,
    setPhoneNumber,
    setPassword,
    universities,
    error,
    submitting,
    submit,
    goBack: () => navigation.goBack(),
  };
}
