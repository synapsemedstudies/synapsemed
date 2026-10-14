import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(var(--border, 217.2 32.6% 17.5%))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        space: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
