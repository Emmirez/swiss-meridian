/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B2545",
          50: "#EAF0FA",
          100: "#CBDAF0",
          200: "#9FBBE1",
          300: "#6E97CE",
          400: "#4A78B8",
          500: "#2C5A9C",
          600: "#1D4179",
          700: "#132E5C",
          800: "#0B2545",
          900: "#071A33",
        },
        gold: {
          DEFAULT: "#C9A227",
          50: "#FBF4DD",
          100: "#F6E7B4",
          200: "#EFD584",
          300: "#E6C154",
          400: "#D9AF3B",
          500: "#C9A227",
          600: "#A6821D",
          700: "#7D6216",
          800: "#54420F",
          900: "#2C2208",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px -8px rgba(11, 37, 69, 0.18)",
        soft: "0 4px 16px -4px rgba(11, 37, 69, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
    },
  },
  plugins: [],
};
