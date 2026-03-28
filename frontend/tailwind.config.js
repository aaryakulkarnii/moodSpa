/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        pulseSoft: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
      },
    },
  },
  plugins: [],
};
