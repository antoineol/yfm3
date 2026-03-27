import { describe, expect, it } from "vitest";
import { patchSettingsIni } from "../../bridge/settings.ts";

describe("patchSettingsIni", () => {
  it("returns patched: false when already enabled", () => {
    const ini = "[Hacks]\nExportSharedMemory = true\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(false);
    expect(result.content).toBe(ini);
  });

  it("patches ExportSharedMemory = false to true", () => {
    const ini = "[Hacks]\nExportSharedMemory = false\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("ExportSharedMemory = true");
    expect(result.content).not.toContain("false");
  });

  it("inserts key when [Hacks] exists but key is missing", () => {
    const ini = "[Hacks]\nSomeOther = value\n[Display]\nFoo = bar\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    const lines = result.content.split("\n");
    const hacksIdx = lines.indexOf("[Hacks]");
    const displayIdx = lines.indexOf("[Display]");
    const exportIdx = lines.indexOf("ExportSharedMemory = true");
    expect(exportIdx).toBeGreaterThan(hacksIdx);
    expect(exportIdx).toBeLessThan(displayIdx);
  });

  it("appends [Hacks] section when missing", () => {
    const ini = "[Display]\nFoo = bar\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("[Hacks]");
    expect(result.content).toContain("ExportSharedMemory = true");
  });

  it("handles empty file", () => {
    const result = patchSettingsIni("");
    expect(result.patched).toBe(true);
    expect(result.content).toContain("[Hacks]");
    expect(result.content).toContain("ExportSharedMemory = true");
  });

  it("preserves CRLF line endings", () => {
    const ini = "[Hacks]\r\nExportSharedMemory = false\r\n[Display]\r\nFoo = bar\r\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("\r\n");
    expect(result.content).not.toContain("false");
    // Verify no bare LF was introduced
    const withoutCrlf = result.content.replace(/\r\n/g, "");
    expect(withoutCrlf).not.toContain("\n");
  });

  it("preserves other settings in [Hacks] section", () => {
    const ini =
      "[Hacks]\nUseOldMDECRoutines = false\nExportSharedMemory = false\nFastBoot = true\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("UseOldMDECRoutines = false");
    expect(result.content).toContain("FastBoot = true");
    expect(result.content).toContain("ExportSharedMemory = true");
  });

  it("handles key with extra whitespace", () => {
    const ini = "[Hacks]\nExportSharedMemory  =  false\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("ExportSharedMemory = true");
  });

  it("inserts key at end of [Hacks] when it's the last section", () => {
    const ini = "[Display]\nFoo = bar\n[Hacks]\nSomeOther = value\n";
    const result = patchSettingsIni(ini);
    expect(result.patched).toBe(true);
    expect(result.content).toContain("ExportSharedMemory = true");
    const lines = result.content.split("\n");
    const hacksIdx = lines.indexOf("[Hacks]");
    const exportIdx = lines.indexOf("ExportSharedMemory = true");
    expect(exportIdx).toBeGreaterThan(hacksIdx);
  });
});
