import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": path.resolve(import.meta.dirname, "src/engine"),
    },
  },
  test: {
    include: [
      "tests/**/*.test.ts",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "scripts/**/*.test.ts",
    ],
    exclude: ["**/*.integration.test.ts"],
  },
});
