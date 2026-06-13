import path from "node:path";
import { defineConfig } from "vitest/config";

const DOM_TESTS = [
  "src/ui/**/*.test.tsx",
  "src/ui/features/collection/use-collection-view-model.test.ts",
  "src/ui/features/hand/CheatViewSwitch.test.ts",
  "src/ui/features/hand/use-post-duel-suggestion.test.ts",
  "src/ui/features/hand/use-zone-toggle.test.ts",
];

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
      "bridge/**/*.test.ts",
    ],
    exclude: [
      "**/*.integration.test.ts",
      ...DOM_TESTS,
      "tests/bridge/**/*.test.ts",
      "bridge/**/*.test.ts",
    ],
  },
});
