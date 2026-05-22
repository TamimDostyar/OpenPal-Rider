/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // BuddyRide design tokens (see BuddyRide/tokens.css).
      colors: {
        cream: "#FAF6EF",
        "cream-2": "#F2EDE3",
        ink: "#1A1815",
        "ink-2": "#3A352E",
        muted: "#8A8378",
        line: "#E6DFD2",
        "line-2": "#EDE7DA",
        coral: "#FF5B43",
        "coral-dk": "#E94527",
        sage: "#2C4A3E",
        "sage-2": "#3D6354",
        sun: "#F5D27A",
        sky: "#BFD8E6",
        rose: "#F2C7BC",
        canvas: "#E8E2D4",
      },
    },
  },
  plugins: [],
};
