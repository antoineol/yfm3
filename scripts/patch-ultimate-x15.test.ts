import { describe, expect, test } from "vitest";
import { buildUltimateX15Patch } from "./patch-ultimate-x15.ts";

describe("Ultimate x15 drop patch", () => {
  test("matches the documented final hook and host bytes", () => {
    const patch = buildUltimateX15Patch();

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
      0x8f8402e0, // lw a0, 0x02e0(gp)
      0x90830039, // lbu v1, 0x0039(a0)
      0x90820038, // lbu v0, 0x0038(a0)
      0x0003182b, // sltu v1, zero, v1
      0x00038840, // sll s1, v1, 1
      0x2c420003, // sltiu v0, v0, 3
      0x10400002, // beq v0, zero, useComputedPool
      0x00000000, // nop
      0x24110001, // addiu s1, zero, 1
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
    ]);
  });

  test("verifies the overwritten local host bytes against unpatched Ultimate", () => {
    expect(buildUltimateX15Patch().localProgramVanilla).toEqual([
      0x9382025d, 0x278502d0, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518,
      0x00000000, 0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f,
      0x8c830000, 0x00000000, 0xa4620518, 0x9382025d, 0x00000000, 0x38420001, 0x00021080,
      0x00452021, 0x8c830000, 0x00000000, 0x9462051a,
    ]);
  });
});
