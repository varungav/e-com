import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f1fd",
          100: "#e6e4fb",
          200: "#cac5f7",
          300: "#a79ef0",
          400: "#8b7ee8",
          500: "#6d5ce0",
          600: "#5b3fd6",
          700: "#4d31c0",
          800: "#40299c",
          light: "#7c6df0",
          DEFAULT: "#5b3fd6",
          dark: "#40299c",
        },
        ink: {
          50: "#f7f7f9",
          100: "#eeeef2",
          400: "#6b6d7c",
          600: "#484a58",
          900: "#14151f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20, 21, 31, 0.04), 0 8px 24px -8px rgba(20, 21, 31, 0.08)",
        hover: "0 4px 8px rgba(20, 21, 31, 0.06), 0 16px 32px -12px rgba(20, 21, 31, 0.16)",
      },
      backgroundImage: {
        hero: "radial-gradient(120% 120% at 50% -10%, #efe9ff 0%, #f7f7fb 55%, #f7f7fb 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
