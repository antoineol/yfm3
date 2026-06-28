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

interface RebuildManifest {
  schemaVersion: 1;
  serial: string;
  name: string;
  base: "extracted_executable";
  output: string;
  units: string[];
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
const manifestPath = process.argv[3] ?? "decomp/manifests/SLUS_014.11.json";

rebuildExecutableFromManifest(statePath, manifestPath);

function rebuildExecutableFromManifest(stateFile: string, manifestFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const manifest = readJson<RebuildManifest>(manifestFile);
  const serial = required(state.target.serial, "target.serial");
  const extractedExePath = required(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = required(state.target.exeSha256, "target.exeSha256");
  const loadAddress = required(state.target.exeLoadAddr, "target.exeLoadAddr");
  if (!existsSync(extractedExePath))
    throw new Error(`Extracted executable not found: ${extractedExePath}`);

  assertEqual(manifest.schemaVersion, 1, "manifest.schemaVersion");
  assertEqual(manifest.serial, serial, "manifest.serial");
  assertEqual(manifest.base, "extracted_executable", "manifest.base");
  if (manifest.units.length === 0) throw new Error("manifest.units is empty");

  const original = readFileSync(extractedExePath);
  assertEqual(sha256(original), expectedExeSha256, "original extracted executable SHA-256");
  const rebuilt = Buffer.from(original);
  const overlays: Array<{ start: number; end: number; path: string }> = [];

  for (const unitPath of manifest.units) {
    const unit = readJson<MatchingUnit>(unitPath);
    verifyUnit(unit, serial, loadAddress);
    verifyNoOverlap(overlays, unit.range.fileStart, unit.range.fileEnd, unitPath);

    const unitBytes = unitBytesLe(unit);
    const originalBytes = original.subarray(unit.range.fileStart, unit.range.fileEnd);
    assertEqual(
      originalBytes.toString("hex"),
      unitBytes.toString("hex"),
      `${unitPath} bytes vs original executable`,
    );
    unitBytes.copy(rebuilt, unit.range.fileStart);
    overlays.push({ start: unit.range.fileStart, end: unit.range.fileEnd, path: unitPath });
  }

  const rebuiltSha256 = sha256(rebuilt);
  assertEqual(rebuiltSha256, expectedExeSha256, "manifest rebuilt executable SHA-256");
  mkdirSync(dirname(manifest.output), { recursive: true });
  writeFileSync(manifest.output, rebuilt);
  console.log(
    `Rebuilt executable from ${manifestFile}: units=${manifest.units.length}, output=${manifest.output}, sha256=${rebuiltSha256}`,
  );
}

function verifyUnit(unit: MatchingUnit, serial: string, loadAddress: number): void {
  assertEqual(unit.schemaVersion, 1, `${unit.name}.schemaVersion`);
  assertEqual(unit.serial, serial, `${unit.name}.serial`);
  assertEqual(unit.range.fileEnd - unit.range.fileStart, unit.range.size, `${unit.name}.file size`);
  assertEqual(unit.range.ramEnd - unit.range.ramStart, unit.range.size, `${unit.name}.RAM size`);
  assertEqual(
    unit.range.fileStart,
    0x800 + (unit.range.ramStart - loadAddress),
    `${unit.name}.fileStart vs RAM`,
  );
  const lines = unit.sourceType === "byte_replay" ? unit.words : unit.instructions;
  assertEqual(lines.length * 4, unit.range.size, `${unit.name}.instruction count`);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) throw new Error(`${unit.name}.instructions[${i}] missing`);
    assertEqual(line.ram, unit.range.ramStart + i * 4, `${unit.name}.instructions[${i}].ram`);
    if (line.asm.trim() === "") throw new Error(`${unit.name}.instructions[${i}] asm is empty`);
    if (unit.sourceType === "byte_replay") {
      const word = unit.words[i];
      if (!word) throw new Error(`${unit.name}.words[${i}] missing`);
      assertEqual(
        Buffer.from(word.bytesLe, "hex").readUInt32LE(0).toString(16).padStart(8, "0"),
        word.word,
        `${unit.name}.words[${i}] encoding`,
      );
    }
  }
}

function verifyNoOverlap(
  overlays: Array<{ start: number; end: number; path: string }>,
  start: number,
  end: number,
  path: string,
): void {
  for (const existing of overlays) {
    if (start < existing.end && end > existing.start) {
      throw new Error(`Unit ${path} overlaps ${existing.path}`);
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
