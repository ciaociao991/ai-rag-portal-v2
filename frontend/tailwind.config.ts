import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        muted: "#667085",
        line: "#E5E7EB",
        surface: "#F8FAFC",
        accent: "#0F766E",
        "accent-soft": "#F0FDFA",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-system", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
        "card-hover": "0 4px 12px rgba(16,24,40,0.08), 0 2px 8px rgba(16,24,40,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
