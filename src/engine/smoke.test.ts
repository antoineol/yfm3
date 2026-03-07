import { expect, test } from "vitest";

import { optimizeDeck } from "./index.ts";

test("engine boundary works", () => {
  expect(typeof optimizeDeck).toBe("function");
});
