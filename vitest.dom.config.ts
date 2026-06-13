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
      "src/ui/**/*.test.tsx",
      "src/ui/features/collection/use-collection-view-model.test.ts",
      "src/ui/features/hand/CheatViewSwitch.test.ts",
      "src/ui/features/hand/use-post-duel-suggestion.test.ts",
      "src/ui/features/hand/use-zone-toggle.test.ts",
    ],
    exclude: ["**/*.integration.test.ts"],
  },
});
