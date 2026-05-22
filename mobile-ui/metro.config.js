const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Wire NativeWind so Tailwind classes compile through Metro.
module.exports = withNativeWind(config, { input: "./global.css" });
