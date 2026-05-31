import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#d8dee8",
        paper: "#fbfcff",
        brand: "#2457c5",
        success: "#12805c",
        warning: "#b76e00"
      },
      boxShadow: {
        page: "0 18px 50px rgba(28, 39, 64, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
