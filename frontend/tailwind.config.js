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
          50: "#e8f5ff",
          100: "#c8e6ff",
          500: "#177ddc",
          600: "#0f65b3",
          700: "#0b4f8d"
        }
      }
    }
  },
  plugins: []
};
