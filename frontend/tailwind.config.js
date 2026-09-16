/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#F7F7F5", dark: "#121316" },
        surface: { DEFAULT: "#FFFFFF", dark: "#1B1C20" },
        border: { DEFAULT: "#E4E4E1", dark: "#2A2B30" },
        ink: { DEFAULT: "#1A1B1E", dark: "#EDEDEE" },
        muted: { DEFAULT: "#7A7B82", dark: "#93949B" },
        accent: { DEFAULT: "#3661E8", dark: "#5B82F2" },
        cat: {
          images: "#2E9E6D",
          documents: "#3661E8",
          videos: "#8B5CF6",
          audio: "#E8973A",
          archives: "#C2410C",
          code: "#0EA5A0",
          other: "#7A7B82",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
