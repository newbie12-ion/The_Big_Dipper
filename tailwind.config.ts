import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#16a34a",
          dark: "#14532d",
          amber: "#c17f23",
          cream: "#f8f5ef",
          ink: "#12312a",
          muted: "#3f5148",
          line: "#dce6de",
        },
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 40px rgba(18, 49, 42, 0.08)",
      },
      backgroundImage: {
        field: "radial-gradient(circle at top left, rgba(34,197,94,0.28), transparent 42%), linear-gradient(135deg, rgba(22,163,74,0.08), rgba(193,127,35,0.12))",
      },
    },
  },
  plugins: [],
} satisfies Config;
