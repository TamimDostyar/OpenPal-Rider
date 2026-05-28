/** @type {import('tailwindcss').Config} */

// Every color is a CSS variable (RGB channels) so the whole palette can swap
// between light and dark in one place — see global.css. Components keep using
// the same semantic class names (bg-cream, text-ink, …); only the values flip.
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces.
        cream: withVar("--c-cream"),
        "cream-2": withVar("--c-cream-2"),
        canvas: withVar("--c-canvas"),

        // Text.
        ink: withVar("--c-ink"),
        "ink-2": withVar("--c-ink-2"),
        muted: withVar("--c-muted"),

        // Hairlines and dividers.
        line: withVar("--c-line"),
        "line-2": withVar("--c-line-2"),

        // Accents.
        coral: withVar("--c-coral"),
        "coral-dk": withVar("--c-coral-dk"),
        sage: withVar("--c-sage"),
        "sage-2": withVar("--c-sage-2"),
        sun: withVar("--c-sun"),
        sky: withVar("--c-sky"),
        rose: withVar("--c-rose"),

        // Semantic ride tones.
        //  driver    = OFFERING a ride (green)
        //  passenger = LOOKING for a ride (red)
        driver: withVar("--c-driver"),
        "driver-bg": withVar("--c-driver-bg"),
        "driver-border": withVar("--c-driver-border"),
        passenger: withVar("--c-passenger"),
        "passenger-bg": withVar("--c-passenger-bg"),
        "passenger-border": withVar("--c-passenger-border"),
      },
    },
  },
  plugins: [],
};
