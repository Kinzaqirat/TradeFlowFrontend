import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tf-bg": "#08111f",
        "tf-surface": "#0c1a2e",
        "tf-elevated": "#091622",
        "tf-border": "rgba(255, 255, 255, 0.08)",
        "tf-green": "#00e5b3",
        "tf-teal": "#00c9a7",
        "tf-red": "#ff4d6a",
        "tf-blue": "#4493f8",
        "tf-text": "#ffffff",
        "tf-muted": "rgba(255, 255, 255, 0.38)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["DM Sans", "sans-serif"],
        syne: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
