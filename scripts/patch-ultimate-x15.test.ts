import { describe, expect, test } from "vitest";
import {
  buildUltimateX15CavePatches,
  buildUltimateX15CaveProgram,
  buildUltimateX15LocalCavePatches,
  buildUltimateX15LocalCaveProgram,
  buildUltimateX15LocalFullRandomPatches,
  buildUltimateX15LocalFullRandomProgram,
  buildUltimateX15LocalHiddenRandomPatches,
  buildUltimateX15LocalHiddenRandomProgram,
  buildUltimateX15Patches,
} from "./patch-ultimate-x15.ts";

describe("Ultimate x15 drop patch", () => {
  test("patches only the existing card-credit increment", () => {
    expect(buildUltimateX15Patches()).toEqual([
      {
        fileOffset: 0x120ac,
        ram: 0x800218ac,
        vanilla: 0x24420001,
        patched: 0x2442000f,
        label: "card-credit increment +1 -> +15",
      },
    ]);
  });

  test("can build a cave-smoke variant with the same +15 semantics", () => {
    expect(buildUltimateX15CavePatches()).toEqual([
      {
        fileOffset: 0x120ac,
        ram: 0x800218ac,
        vanilla: 0x24420001,
        patched: 0x2442000f,
        label: "card-credit increment +1 -> +15",
      },
      {
        fileOffset: 0x12710,
        ram: 0x80021f10,
        vanilla: 0x8444003c,
        patched: 0x0806ab10,
        label: "award.lh->j cave smoke routine",
      },
      {
        fileOffset: 0x12714,
        ram: 0x80021f14,
        vanilla: 0x0c008625,
        patched: 0x00000000,
        label: "award.jal->nop",
      },
    ]);
    expect(buildUltimateX15CaveProgram()).toEqual([
      0x8f8202e0, // lw v0, 0x02e0(gp)
      0x8444003c, // lh a0, 0x003c(v0)
      0x0c008625, // jal 0x80021894
      0x00000000, // nop
      0x08008827, // j 0x8002209c
      0x00000000, // nop
    ]);
  });

  test("can build a local-cave smoke variant away from the alpha cave", () => {
    expect(buildUltimateX15LocalCavePatches()).toEqual([
      {
        fileOffset: 0x120ac,
        ram: 0x800218ac,
        vanilla: 0x24420001,
        patched: 0x2442000f,
        label: "card-credit increment +1 -> +15",
      },
      {
        fileOffset: 0x12710,
        ram: 0x80021f10,
        vanilla: 0x8444003c,
        patched: 0x080087c9,
        label: "award.lh->j local cave smoke routine",
      },
      {
        fileOffset: 0x12714,
        ram: 0x80021f14,
        vanilla: 0x0c008625,
        patched: 0x00000000,
        label: "award.jal->nop",
      },
    ]);
    expect(buildUltimateX15LocalCaveProgram()).toEqual(buildUltimateX15CaveProgram());
  });

  test("can build a local hidden-random variant without the same-card increment patch", () => {
    expect(buildUltimateX15LocalHiddenRandomPatches()).toEqual([
      {
        fileOffset: 0x12710,
        ram: 0x80021f10,
        vanilla: 0x8444003c,
        patched: 0x080087c9,
        label: "award.lh->j local hidden-random routine",
      },
      {
        fileOffset: 0x12714,
        ram: 0x80021f14,
        vanilla: 0x0c008625,
        patched: 0x00000000,
        label: "award.jal->nop",
      },
    ]);
    expect(buildUltimateX15LocalHiddenRandomProgram()).toEqual([
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
      0x3c06801d, // lui a2, 0x801d
      0x24c60200, // addiu a2, a2, 0x0200
      0x2442004f, // addiu v0, v0, 0x004f
      0x00461821, // addu v1, v0, a2
      0x90620000, // lbu v0, 0(v1)
      0x00000000, // nop
      0x24420001, // addiu v0, v0, 1
      0x2c4400fb, // sltiu a0, v0, 251
      0x14800002, // bne a0, zero, storeHiddenDrop
      0x00000000, // nop
      0x240200fa, // addiu v0, zero, 250
      0xa0620000, // sb v0, 0(v1)
      0x2610ffff, // addiu s0, s0, -1
      0x1600ffef, // bne s0, zero, extraLoop
      0x00000000, // nop
      0x08008827, // j 0x8002209c
      0x00000000, // nop
    ]);
  });

  test("can build a local full-random variant that updates the recent/new list", () => {
    expect(buildUltimateX15LocalFullRandomPatches()).toEqual([
      {
        fileOffset: 0x12710,
        ram: 0x80021f10,
        vanilla: 0x8444003c,
        patched: 0x080087c9,
        label: "award.lh->j local full-random routine",
      },
      {
        fileOffset: 0x12714,
        ram: 0x80021f14,
        vanilla: 0x0c008625,
        patched: 0x00000000,
        label: "award.jal->nop",
      },
    ]);
    expect(buildUltimateX15LocalFullRandomProgram()).toEqual([
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
});
