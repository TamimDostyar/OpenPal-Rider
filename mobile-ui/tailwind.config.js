/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // BuddyRide design tokens (see BuddyRide/tokens.css).
      colors: {
        cream: "#F7F1EB",
        "cream-2": "#EEE3DA",
        ink: "#120C0A",
        "ink-2": "#2E201B",
        muted: "#7A6A5E",
        line: "#E1D4C8",
        "line-2": "#E9DDD2",
        coral: "#8B1C18",
        "coral-dk": "#5E120F",
        sage: "#3B241E",
        "sage-2": "#4A2D26",
        sun: "#C9A07A",
        sky: "#B89A8A",
        rose: "#B27870",
        canvas: "#E6D9CF",
        driver: "#1F7A4A",
        "driver-bg": "#E6F4EA",
        "driver-border": "#C6E6D3",
        passenger: "#B42318",
        "passenger-bg": "#FDECEC",
        "passenger-border": "#F4C7C3",
      },
    },
  },
  plugins: [],
};
