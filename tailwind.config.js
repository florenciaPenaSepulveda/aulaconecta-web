import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        aulaconecta: {
          primary: "#1f3a5f",
          "primary-content": "#ffffff",
          secondary: "#2e6f95",
          "secondary-content": "#ffffff",
          accent: "#b08d57",
          "accent-content": "#ffffff",
          neutral: "#243447",
          "neutral-content": "#e8edf3",
          "base-100": "#ffffff",
          "base-200": "#f3f5f8",
          "base-300": "#dde2ea",
          "base-content": "#1f2937",
          info: "#3b82a0",
          "info-content": "#ffffff",
          success: "#2f7d5b",
          "success-content": "#ffffff",
          warning: "#b7791f",
          "warning-content": "#ffffff",
          error: "#b23b3b",
          "error-content": "#ffffff",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.375rem",
          "--rounded-badge": "0.375rem",
          "--tab-radius": "0.375rem",
        },
      },
    ],
  },
};
