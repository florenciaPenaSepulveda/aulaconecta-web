import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { contentSecurityPolicy } from "./vite.csp";

export default defineConfig(({ mode }) => ({
  plugins: [react(), contentSecurityPolicy(loadEnv(mode, process.cwd(), "").VITE_API_URL || "http://localhost:3000/graphql")],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts", "src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text-summary", "text"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
}));
