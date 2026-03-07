import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": path.resolve(import.meta.dirname, "src/engine"),
    },
  },
  test: {
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 30_000,
  },
});
