import { ping } from "@engine";
import { expect, test } from "vitest";

test("engine boundary works", () => {
  expect(ping()).toBe("engine-ok");
});
