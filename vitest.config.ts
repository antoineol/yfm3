import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": path.resolve(import.meta.dirname, "src/engine"),
    },
  },
  test: {
    setupFiles: ["src/test/setup.ts"],
    include: [
      "tests/**/*.test.ts",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "scripts/**/*.test.ts",
      "bridge/**/*.test.ts",
    ],
    exclude: ["**/*.integration.test.ts"],
  },
});
