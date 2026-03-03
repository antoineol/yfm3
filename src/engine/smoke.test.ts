import { expect, test } from "vitest";

import { ping } from "./index.ts";

test("engine boundary works", () => {
  expect(ping()).toBe("engine-ok");
});

// Phase 0b added
