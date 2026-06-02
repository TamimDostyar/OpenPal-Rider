/**
 * Step 1 of the signup flow: collects user profile fields and sends them to
 * the backend, which responds by emailing a verification code.
 */
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DateField } from "@/components/DateField";
import { FormError } from "@/components/FormError";
import { SchoolField } from "@/components/SchoolField";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useSignup } from "@/hooks/useSignup";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const {
    fields,
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
  } = useSignup();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-8"
        className="-mx-6 px-6"
      >
        <Text className="mb-1 mt-4 text-xs uppercase tracking-widest text-muted">
          Step 1 of 2 · your details
        </Text>
        <Text className="mb-5 text-4xl font-semibold leading-tight text-ink">
          Create your account.
        </Text>

        <View className="gap-4">
          <FormError message={error} />

          <TextField
            label="Full name"
            value={fields.name}
            onChangeText={setName}
            placeholder="Tamim Dostyar"
          />
          <TextField
            label="Campus email"
            value={fields.email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <DateField
            label="Date of birth"
            value={fields.dob}
            onChange={setDob}
            placeholder="MM/DD/YYYY"
            hint="Example: 09/04/2001"
            maximumDate={new Date()}
          />

          <SchoolField
            label="School"
            value={fields.school}
            onChange={setSchool}
            schools={universities.results}
            loading={universities.loading}
            error={universities.error}
            query={universities.query}
            onQueryChange={universities.setQuery}
            hint="Only recognized US schools can be selected."
          />

          <DateField
            label="Graduation date"
            value={fields.graduationDate}
            onChange={setGraduationDate}
            placeholder="MM/DD/YYYY"
            hint="Example: 05/01/2026"
          />
          <TextField
            label="Phone number"
            value={fields.phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="10-digit number"
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextField
            label="Password"
            value={fields.password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />
        </View>

        <View className="gap-3 py-6">
          <Button
            label="Send verification code"
            variant="coral"
            onPress={submit}
            loading={submitting}
          />
          <Text className="text-center text-xs leading-5 text-muted">
            By creating an account, you agree to our{" "}
            <Text
              className="font-semibold text-ink underline"
              onPress={() => navigation.navigate("Terms")}
            >
              Terms &amp; Conditions
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
