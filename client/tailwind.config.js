/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#E9CEAF",
        "cream-light": "#F2E2CF", // lighter tint of cream, used in the logo gradient/wordmark
        orange: "#ED802A",
        yellow: "#EDC45A",
        blue: "#65BCB5",
        ink: "#2B2118",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        magic: ["Cinzel", "serif"],
        elongated: ["Cormorant", "serif"],
      },
    },
  },
  plugins: [],
};