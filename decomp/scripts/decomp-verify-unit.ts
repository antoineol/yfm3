import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { encodeMipsInstructionLe } from "./mips-asm.ts";

interface DecompState {
  schemaVersion: 1;
  target: {
    serial: string | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    extractedExePath: string | null;
  };
}

type MatchingUnit = ByteReplayUnit | MipsAsmUnit;

interface UnitBase {
  schemaVersion: 1;
  serial: string;
  name: string;
  evidenceClass: "byte_replay_unit" | "source_generated_unit";
  sourceType: "byte_replay" | "mips_asm";
  range: {
    fileStart: number;
    fileEnd: number;
    ramStart: number;
    ramEnd: number;
    size: number;
  };
}

interface ByteReplayUnit extends UnitBase {
  evidenceClass: "byte_replay_unit";
  sourceType: "byte_replay";
  words: Array<{
    ram: number;
    word: string;
    bytesLe: string;
    asm: string;
  }>;
}

interface MipsAsmUnit extends UnitBase {
  evidenceClass: "source_generated_unit";
  sourceType: "mips_asm";
  instructions: Array<{
    ram: number;
    asm: string;
  }>;
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const unitPath = process.argv[3] ?? "decomp/units/SLUS_014.11/entrypoint-init-v0.json";

verifyMatchingUnit(statePath, unitPath);

function verifyMatchingUnit(stateFile: string, unitFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const unit = readJson<MatchingUnit>(unitFile);
  const serial = required(state.target.serial, "target.serial");
  const extractedExePath = required(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = required(state.target.exeSha256, "target.exeSha256");
  const loadAddress = required(state.target.exeLoadAddr, "target.exeLoadAddr");
  if (!existsSync(extractedExePath))
    throw new Error(`Extracted executable not found: ${extractedExePath}`);

  assertEqual(unit.schemaVersion, 1, "unit.schemaVersion");
  assertEqual(unit.serial, serial, "unit.serial");
  verifyUnitRange(unit, loadAddress);

  const exe = readFileSync(extractedExePath);
  const unitBytes = unitBytesLe(unit);
  const originalBytes = exe.subarray(unit.range.fileStart, unit.range.fileEnd);
  assertEqual(
    originalBytes.toString("hex"),
    unitBytes.toString("hex"),
    "unit bytes vs original executable range",
  );

  const rebuilt = Buffer.from(exe);
  unitBytes.copy(rebuilt, unit.range.fileStart);
  const rebuiltSha256 = sha256(rebuilt);
  assertEqual(rebuiltSha256, expectedExeSha256, "rebuilt executable SHA-256");

  const outPath = `decomp/build/units/${unit.serial}.${unit.name}.exe`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, rebuilt);
  console.log(
    `Verified matching unit ${unitFile}: ${unit.name}, size=${unit.range.size}, rebuilt=${outPath}`,
  );
}

function verifyUnitRange(unit: MatchingUnit, loadAddress: number): void {
  assertEqual(
    unit.range.fileEnd - unit.range.fileStart,
    unit.range.size,
    "unit computed file size",
  );
  assertEqual(unit.range.ramEnd - unit.range.ramStart, unit.range.size, "unit computed RAM size");
  assertEqual(
    unit.range.fileStart,
    0x800 + (unit.range.ramStart - loadAddress),
    "unit fileStart vs RAM",
  );
  assertEqual(unit.range.fileEnd, unit.range.fileStart + unit.range.size, "unit fileEnd");
  assertEqual(unit.range.ramEnd, unit.range.ramStart + unit.range.size, "unit ramEnd");
  const lines = unit.sourceType === "byte_replay" ? unit.words : unit.instructions;
  assertEqual(lines.length * 4, unit.range.size, "unit instruction count vs size");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) throw new Error(`Missing instruction ${i}`);
    assertEqual(line.ram, unit.range.ramStart + i * 4, `instruction ${i} RAM`);
    if (line.asm.trim() === "") throw new Error(`instruction ${i} asm is empty`);
    if (unit.sourceType === "byte_replay") {
      const word = unit.words[i];
      if (!word) throw new Error(`Missing word ${i}`);
      assertEqual(word.bytesLe.length, 8, `word ${i} bytesLe length`);
      assertEqual(word.word.length, 8, `word ${i} word length`);
      assertEqual(
        Buffer.from(word.bytesLe, "hex").readUInt32LE(0).toString(16).padStart(8, "0"),
        word.word,
        `word ${i} LE encoding`,
      );
    }
  }
}

function unitBytesLe(unit: MatchingUnit): Buffer {
  if (unit.sourceType === "byte_replay") {
    return Buffer.concat(unit.words.map((word) => Buffer.from(word.bytesLe, "hex")));
  }
  return Buffer.concat(
    unit.instructions.map((instruction) => encodeMipsInstructionLe(instruction.asm)),
  );
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function required<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`Missing ${label}`);
  return value;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
