import { describe, expect, test } from "vitest";
import { buildLocalX15Patch } from "./patch-ultimate-x15.ts";

describe("local x15 drop patch", () => {
  test("matches the documented final hook and host bytes", () => {
    const patch = buildLocalX15Patch("SLUS_027.11");

    expect(patch.id).toBe("local-award-trampoline");
    expect(patch.name).toBe("Local x15-compatible layout");
    expect(patch.gameSerial).toBe("SLUS_027.11");
    expect(patch.requiredWords).toEqual([
      {
        fileOffset: 0x120ac,
        ram: 0x800218ac,
        vanilla: 0x24420001,
        patched: 0x24420001,
        label: "card-credit increment remains +1",
      },
    ]);
    expect(patch.writeWords).toEqual([
      {
        fileOffset: 0x12460,
        ram: 0x80021c60,
        vanilla: 0x0c008604,
        patched: 0x0c0087da,
        label: "visible-pick.jal->freeze pool wrapper",
      },
      {
        fileOffset: 0x12710,
        ram: 0x80021f10,
        vanilla: 0x8444003c,
        patched: 0x080087c9,
        label: "award.lh->j local x15 routine",
      },
      {
        fileOffset: 0x12714,
        ram: 0x80021f14,
        vanilla: 0x0c008625,
        patched: 0x00000000,
        label: "award.jal->nop",
      },
    ]);
    expect(patch.localProgramOffset).toBe(0x12724);
    expect(patch.localProgramRam).toBe(0x80021f24);
    expect(patch.localProgram).toEqual([
      0x8f8202e0, // lw v0, 0x02e0(gp)
      0x8444003c, // lh a0, 0x003c(v0)
      0x0c008625, // jal 0x80021894
      0x00000000, // nop
      0x9051003b, // lbu s1, 0x003b(v0)
      0x2410000e, // addiu s0, zero, 14
      0x02202021, // addu a0, s1, zero
      0x0c008604, // jal 0x80021810
      0x00000000, // nop
      0x00402021, // addu a0, v0, zero
      0x0c008625, // jal 0x80021894
      0x00000000, // nop
      0x2610ffff, // addiu s0, s0, -1
      0x1600fff8, // bne s0, zero, extraLoop
      0x00000000, // nop
      0x08008827, // j 0x8002209c
      0x00000000, // nop
      0x03e08821, // addu s1, ra, zero
      0x8f8302e0, // lw v1, 0x02e0(gp)
      0x0c008604, // jal 0x80021810
      0xa064003b, // sb a0, 0x003b(v1)
      0x02200008, // jr s1
      0x00000000, // nop
      0x00000000, // nop
      0x00000000, // nop
    ]);
  });

  test("verifies the overwritten local host bytes against unpatched Ultimate", () => {
    expect(buildLocalX15Patch("SLUS_027.11").localProgramVanilla).toEqual([
      0x9382025d, 0x278502d0, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518,
      0x00000000, 0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f,
      0x8c830000, 0x00000000, 0xa4620518, 0x9382025d, 0x00000000, 0x38420001, 0x00021080,
      0x00452021, 0x8c830000, 0x00000000, 0x9462051a,
    ]);
  });
  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("uses the same local award trampoline for %s", (serial) => {
    const patch = buildLocalX15Patch(serial);
    const referencePatch = buildLocalX15Patch("SLUS_027.11");

    expect(patch.id).toBe("local-award-trampoline");
    expect(patch.name).toBe("Local x15-compatible layout");
    expect(patch.gameSerial).toBe(serial);
    expect(patch.requiredWords).toEqual(referencePatch.requiredWords);
    expect(patch.writeWords).toEqual(referencePatch.writeWords);
    expect(patch.localProgramOffset).toBe(referencePatch.localProgramOffset);
    expect(patch.localProgramRam).toBe(referencePatch.localProgramRam);
    expect(patch.localProgramVanilla).toEqual(referencePatch.localProgramVanilla);
    expect(patch.localProgram).toEqual(referencePatch.localProgram);
  });
});
