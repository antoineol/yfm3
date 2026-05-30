import { describe, expect, it } from "vitest";
import { readPadBindings } from "../../bridge/input.ts";

describe("readPadBindings", () => {
  it("reads keyboard bindings from composite DuckStation entries", () => {
    const bindings = readPadBindings(`
[Pad1]
Right = Keyboard/Right & XInput-0/DPadRight
Cross = Keyboard/X & XInput-0/A
Circle = Keyboard/D & XInput-0/B
`);

    expect(bindings.right).toBe(0x27);
    expect(bindings.cross).toBe(0x58);
    expect(bindings.circle).toBe(0x44);
  });
});
