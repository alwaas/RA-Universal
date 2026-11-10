import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#7B181E",
          "primary-hover": "#5F1217",
          secondary: "#FDFBF7",
        },
        accent: {
          gold: "#B45309",
        },
        cta: {
          buynow: "#F59E0B",
          "buynow-hover": "#D97706",
        },
        semantic: {
          success: "#15803D",
          warning: "#C2410C",
          error: "#DC2626",
          whatsapp: "#25D366",
        },
        neutral: {
          900: "#1C1917",
          700: "#44403C",
          500: "#78716C",
          300: "#D6D3D1",
          100: "#F5F5F4",
          50: "#FAFAF9",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card-hover": "0 6px 16px -2px rgba(28, 25, 23, 0.08)",
        dropdown: "0 10px 25px -3px rgba(28, 25, 23, 0.12), 0 4px 6px -2px rgba(28, 25, 23, 0.04)",
        modal: "0 20px 35px -5px rgba(28, 25, 23, 0.20), 0 10px 10px -5px rgba(28, 25, 23, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
