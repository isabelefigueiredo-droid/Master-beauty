/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#e879a0",
          dark: "#0a0a0a",
          card: "#141414",
          border: "#2a2a2a",
          muted: "#888888",
        },
      },
    },
  },
  plugins: [],
};
