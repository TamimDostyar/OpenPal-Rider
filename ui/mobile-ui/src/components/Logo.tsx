import React from "react";
import { Text, View } from "react-native";
import { Image } from 'react-native';
interface LogoProps {
  tone?: "ink" | "cream";
}

export function Logo({ tone = "ink" }: LogoProps) {
  const textColor = tone === "cream" ? "text-cream" : "text-ink";
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-7 w-11">
        <Image 
          source={require('../../asset/iconWelcome.png')} 
            style={{ height: '100%', width: '100%', alignSelf:'center'}}
          resizeMode="contain"
        />
      </View>
      <Text className={`text-2xl font-semibold ${textColor}`}>PalRiders</Text>
    </View>
  );
}
