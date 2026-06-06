import { describe, expect, test } from "vitest";
import { getPalFrWordingStatus } from "./iso-edit.ts";

const PAL_FR_DISC = "gamedata/vanilla-bin/Yu-Gi-Oh! Forbidden Memories (France).bin";

describe("PAL FR ISO editing", () => {
  test("detects the live glyph renderer table words that need the oe ligature fix", () => {
    const status = getPalFrWordingStatus(PAL_FR_DISC);
    expect(status.supported).toBe(true);
    if (!status.supported) return;

    expect(status.glyphRenderingPatch.applied).toBe(false);
    expect(target(status, "œ")).toMatchObject({
      rawByte: 0x3f,
      tableRamAddress: 0x801d90fc,
      fileOffset: 0x1c98fc,
      currentWord: 0x074089e7,
      expectedWord: 0x075089e7,
    });
    expect(target(status, "Œ")).toMatchObject({
      rawByte: 0x69,
      tableRamAddress: 0x801d91a4,
      fileOffset: 0x1c99a4,
      currentWord: 0x059089b2,
      expectedWord: 0x05a089b2,
    });
  }, 15000);
});

function target(
  status: Extract<ReturnType<typeof getPalFrWordingStatus>, { supported: true }>,
  label: string,
) {
  const found = status.glyphRenderingPatch.targets.find((candidate) => candidate.label === label);
  if (!found) throw new Error(`Missing glyph patch target: ${label}`);
  return found;
}
