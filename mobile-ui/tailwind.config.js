/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surfaces — clean, near-white with cool tint.
        cream: "#FFFFFF",
        "cream-2": "#F5F5F7",
        canvas: "#F0F0F3",

        // Text — high-contrast black, secondary, and mid-gray muted.
        ink: "#0A0A0A",
        "ink-2": "#1F2024",
        muted: "#6B7076",

        // Hairlines and dividers.
        line: "#E4E4E7",
        "line-2": "#EEEEF1",

        // Accents (sparingly used).
        coral: "#DC2626",
        "coral-dk": "#B91C1C",
        sage: "#0E7C66",
        "sage-2": "#0A5C4D",
        sun: "#C2410C",
        sky: "#475569",
        rose: "#9F1239",

        // Semantic ride tones.
        //  driver    = OFFERING a ride (green)
        //  passenger = LOOKING for a ride (red)
        driver: "#0E7C66",
        "driver-bg": "#E6F4F0",
        "driver-border": "#C2E2D9",
        passenger: "#DC2626",
        "passenger-bg": "#FEE7E7",
        "passenger-border": "#F4C2C2",
      },
    },
  },
  plugins: [],
};
