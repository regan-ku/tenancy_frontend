import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // ✅ CRITICAL: This tells Tailwind to scan all these files for classes
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/dashboards/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Our Custom Design System Colors
        primary: {
          DEFAULT: "#0ea5e9", // Sky Blue (Primary Brand Color)
          dark: "#0369a1", // Darker Sky Blue for text/headings
          light: "#e0f2fe", // Very light blue for backgrounds
        },
        secondary: {
          DEFAULT: "#10b981", // Emerald Green (Success/Action Color)
          dark: "#047857",
          light: "#d1fae5",
        },
        surface: {
          muted: "#f8fafc", // Light gray background for dashboards/wizards
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
