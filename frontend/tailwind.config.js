/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./layout/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        night: {
          50:  "#07080F",
          100: "#0B0C16",
          200: "#0E0F1A",
          300: "#13141F",
          400: "#181927",
          500: "#1E2035",
          600: "#252640",
          700: "#2D2E50",
        },
        pro: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        cta: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        nh: {
          bg: "#090B13",
          surface: "#111420",
          raised: "#181C2A",
          overlay: "#1E2338",
          border: "rgba(255,255,255,0.08)",
          teal: "#06B6D4",
          ai: "#5B6EF5",
          tx1: "#EEF0FF",
          tx2: "#8B94B8",
          tx3: "#3D4666",
        }
      },
      fontFamily: {
        display: ["Inter", "Manrope", "sans-serif"],
        sans: ["Manrope", "Inter", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out forwards",
        "slide-up":   "slideUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float:   { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
      },
    }
  },
  plugins: []
};
