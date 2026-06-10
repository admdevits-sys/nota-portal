import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 25px 50px -25px rgba(15, 23, 42, 0.25)",
        glass: "0 25px 50px -25px rgba(15, 23, 42, 0.15)",
        glow: "0 0 40px -5px rgba(0, 130, 0, 0.4)",
        "glow-green": "0 0 30px -5px rgba(0, 130, 0, 0.5)",
        "glow-red": "0 0 30px -5px rgba(255, 43, 0, 0.4)",
      },
      colors: {
        // Light Mode - Fundo off-white esverdeado
        background: "#F4F7F4",
        surface: "#FFFFFF",
        foreground: "#1A1A1A",
        muted: "#707070",

        // Dark Mode - Efeito Neon
        backgroundDark: "#0A0A0A",
        surfaceDark: "#1A1A1A",
        foregroundDark: "#E0E0E0",
        mutedDark: "#A0A0A0",

        // Brand Green - Adaptativo
        brandGreen: {
          light: "#008200",      // Light Mode - Verde escuro tradicional
          DEFAULT: "#008200",
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#008200",       // Light Mode
          600: "#007200",
          700: "#005f00",
          neon: "#2DCC2D",       // Dark Mode - Verde neon vibrante
          neonLight: "#3DDC3D",   // Hover state para neon
        },

        // Brand Red - Adaptativo
        brandRed: {
          light: "#FF2B00",       // Light Mode
          DEFAULT: "#FF2B00",
          50: "#ffe8e4",
          100: "#ffc7c0",
          500: "#FF2B00",
          600: "#e02600",
          700: "#c02200",
          soft: "#FF522E",       // Dark Mode - Vermelho mais suave
          softLight: "#FF6B4E",  // Hover state
        },

        // Brand Silver - Metallic
        brandSilver: {
          DEFAULT: "#C3C3C3",
          light: "#707070",
          50: "#f5f5f5",
          100: "#e8e8e8",
          200: "#d4d4d4",
          300: "#c0c0c0",
          400: "#ababab",
          500: "#C3C3C3",
          600: "#b0b0b0",
          700: "#9a9a9a",
          dark: "#A0A0A0",      // Dark Mode
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;