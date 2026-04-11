import { describe, expect, it } from "vitest";
import { parseBootExeName } from "./index.ts";

describe("parseBootExeName", () => {
  it("parses standard SYSTEM.CNF BOOT entry", () => {
    const cnf = "BOOT = cdrom:\\SLUS_014.11;1\r\nTCB = 4\r\nEVENT = 16\r\n";
    expect(parseBootExeName(cnf)).toBe("SLUS_014.11");
  });

  it("parses non-standard exe name", () => {
    const cnf = "BOOT = cdrom:\\FMII.136;1\nTCB = 4\nEVENT = 16\nSTACK = 801FFF00\n";
    expect(parseBootExeName(cnf)).toBe("FMII.136");
  });

  it("handles missing backslash after cdrom:", () => {
    const cnf = "BOOT = cdrom:SLUS_014.11;1\n";
    expect(parseBootExeName(cnf)).toBe("SLUS_014.11");
  });

  it("handles no spaces around equals", () => {
    const cnf = "BOOT=cdrom:\\SLUS_014.11;1\n";
    expect(parseBootExeName(cnf)).toBe("SLUS_014.11");
  });

  it("returns null when no BOOT line", () => {
    expect(parseBootExeName("TCB = 4\nEVENT = 16\n")).toBeNull();
  });
});
