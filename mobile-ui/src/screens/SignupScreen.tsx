import React from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DateField } from "@/components/DateField";
import { FormError } from "@/components/FormError";
import { SchoolField } from "@/components/SchoolField";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useSignup } from "@/hooks/useSignup";

export function SignupScreen() {
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
            placeholder="Alex Rivera"
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
            placeholder="Pick your date of birth"
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
            placeholder="Pick your graduation date"
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

        <View className="py-6">
          <Button
            label="Send verification code"
            variant="coral"
            onPress={submit}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
