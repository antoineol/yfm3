import { describe, expect, it } from "vitest";
import { shouldReloadBridge } from "./watch-files.ts";

describe("shouldReloadBridge", () => {
  it("reloads for bridge runtime TypeScript files", () => {
    expect(shouldReloadBridge("serve.ts")).toBe(true);
    expect(shouldReloadBridge("extract/detect-wamrg.ts")).toBe(true);
  });

  it("ignores bridge test TypeScript files", () => {
    expect(shouldReloadBridge("memory.test.ts")).toBe(false);
    expect(shouldReloadBridge("extract/detect-wamrg.test.ts")).toBe(false);
    expect(shouldReloadBridge("drop-x15-patch.integration.test.ts")).toBe(false);
  });

  it("reloads for package metadata read at bridge startup", () => {
    expect(shouldReloadBridge("package.json")).toBe(true);
  });

  it("ignores unrelated files", () => {
    expect(shouldReloadBridge(undefined)).toBe(false);
    expect(shouldReloadBridge("package-lock.json")).toBe(false);
    expect(shouldReloadBridge("bridge.log")).toBe(false);
    expect(shouldReloadBridge("artwork/card.png")).toBe(false);
  });
});
