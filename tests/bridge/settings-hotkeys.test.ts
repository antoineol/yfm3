import { describe, expect, it } from "vitest";
import { patchLoadStateHotkeys } from "../../bridge/settings.ts";

describe("patchLoadStateHotkeys", () => {
  it("returns patched: false when all hotkeys already set", () => {
    const ini = [
      "[Hotkeys]",
      "LoadGameState1 = Keyboard/F5",
      "LoadGameState2 = Keyboard/F6",
      "LoadGameState3 = Keyboard/F7",
      "LoadGameState4 = Keyboard/F8",
      "LoadGameState5 = Keyboard/F9",
      "LoadGameState6 = Keyboard/F10",
      "LoadGameState7 = Keyboard/F11",
      "LoadGameState8 = Keyboard/F12",
      "",
    ].join("\n");
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(false);
  });

  it("adds missing hotkeys into existing [Hotkeys] section", () => {
    const ini = "[Hotkeys]\nLoadGameState1 = Keyboard/F5\n[Display]\nFoo = bar\n";
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("LoadGameState2 = Keyboard/F6");
    expect(result.content).toContain("LoadGameState8 = Keyboard/F12");
    // Inserted before [Display]
    const lines = result.content.split("\n");
    const displayIdx = lines.indexOf("[Display]");
    const ls2Idx = lines.indexOf("LoadGameState2 = Keyboard/F6");
    expect(ls2Idx).toBeLessThan(displayIdx);
  });

  it("creates [Hotkeys] section when missing", () => {
    const ini = "[Hacks]\nExportSharedMemory = true\n";
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("[Hotkeys]");
    for (let i = 1; i <= 8; i++) {
      expect(result.content).toContain(`LoadGameState${i} = Keyboard/F${i + 4}`);
    }
  });

  it("updates wrong values", () => {
    const ini = "[Hotkeys]\nLoadGameState1 = Keyboard/A\n";
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("LoadGameState1 = Keyboard/F5");
    expect(result.content).not.toContain("Keyboard/A");
  });

  it("handles empty file", () => {
    const result = patchLoadStateHotkeys("");
    expect(result.patched).toBe(true);
    expect(result.content).toContain("[Hotkeys]");
    expect(result.content).toContain("LoadGameState1 = Keyboard/F5");
  });

  it("preserves CRLF line endings", () => {
    const ini = "[Hotkeys]\r\nSomeKey = value\r\n[Display]\r\nFoo = bar\r\n";
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(true);
    // Inserted lines should use CRLF
    const withoutCrlf = result.content.replace(/\r\n/g, "");
    expect(withoutCrlf).not.toContain("\n");
  });

  it("never includes SaveGameState keys", () => {
    const ini = "";
    const result = patchLoadStateHotkeys(ini);
    expect(result.content).not.toContain("SaveGameState");
  });

  it("preserves existing non-load-state hotkeys", () => {
    const ini = "[Hotkeys]\nTogglePause = Keyboard/Space\n";
    const result = patchLoadStateHotkeys(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("TogglePause = Keyboard/Space");
    expect(result.content).toContain("LoadGameState1 = Keyboard/F5");
  });
});
