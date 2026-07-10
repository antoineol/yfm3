import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

interface DecompState {
  schemaVersion: 1;
  target: {
    serial: string | null;
    exeSha256: string | null;
    extractedExePath: string | null;
  };
}

interface LinkedManifest {
  schemaVersion: 1;
  serial: string;
  name: string;
  base: "extracted_executable";
  evidenceClass: "linked_executable";
  sourceGeneratedExecutableBytes: number;
  output: string;
  units: string[];
}

interface LinkedUnit {
  schemaVersion: 1;
  serial: string;
  name: string;
  evidenceClass: "linked_executable";
  sourceType: "mips_asm_linked";
  range: {
    fileStart: number;
    fileEnd: number;
    size: number;
  };
  outputs: {
    unitBinary: string;
  };
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const manifestPath = process.argv[3] ?? "decomp/manifests/SLUS_014.11.linked-asm-v0.json";

verifyLinkedManifest(statePath, manifestPath);

function verifyLinkedManifest(stateFile: string, manifestFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const manifest = readJson<LinkedManifest>(manifestFile);
  const serial = required(state.target.serial, "target.serial");
  const extractedExePath = required(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = required(state.target.exeSha256, "target.exeSha256");
  if (!existsSync(extractedExePath))
    throw new Error(`Extracted executable not found: ${extractedExePath}`);

  assertEqual(manifest.schemaVersion, 1, "manifest.schemaVersion");
  assertEqual(manifest.serial, serial, "manifest.serial");
  assertEqual(manifest.base, "extracted_executable", "manifest.base");
  assertEqual(manifest.evidenceClass, "linked_executable", "manifest.evidenceClass");
  if (manifest.units.length === 0) throw new Error("manifest.units is empty");

  const original = readFileSync(extractedExePath);
  assertEqual(sha256(original), expectedExeSha256, "original executable SHA-256");
  const rebuilt = Buffer.from(original);
  const overlays: Array<{ start: number; end: number; path: string }> = [];
  let linkedBytesTotal = 0;

  for (const unitPath of manifest.units) {
    runVerifier(stateFile, unitPath);
    const unit = readJson<LinkedUnit>(unitPath);
    assertEqual(unit.schemaVersion, 1, `${unitPath}.schemaVersion`);
    assertEqual(unit.serial, serial, `${unitPath}.serial`);
    assertEqual(unit.evidenceClass, "linked_executable", `${unitPath}.evidenceClass`);
    assertEqual(unit.sourceType, "mips_asm_linked", `${unitPath}.sourceType`);
    verifyNoOverlap(overlays, unit.range.fileStart, unit.range.fileEnd, unitPath);

    const linkedBytes = readFileSync(unit.outputs.unitBinary);
    assertEqual(linkedBytes.length, unit.range.size, `${unitPath}.linked byte size`);
    const originalBytes = original.subarray(unit.range.fileStart, unit.range.fileEnd);
    assertEqual(
      linkedBytes.toString("hex"),
      originalBytes.toString("hex"),
      `${unitPath}.linked bytes vs original executable`,
    );
    linkedBytes.copy(rebuilt, unit.range.fileStart);
    overlays.push({ start: unit.range.fileStart, end: unit.range.fileEnd, path: unitPath });
    linkedBytesTotal += linkedBytes.length;
  }

  assertEqual(
    linkedBytesTotal,
    manifest.sourceGeneratedExecutableBytes,
    "manifest.sourceGeneratedExecutableBytes",
  );
  const rebuiltSha256 = sha256(rebuilt);
  assertEqual(rebuiltSha256, expectedExeSha256, "linked manifest rebuilt executable SHA-256");
  mkdirSync(dirname(manifest.output), { recursive: true });
  writeFileSync(manifest.output, rebuilt);
  console.log(
    `Verified linked assembly manifest ${manifestFile}: units=${manifest.units.length}, sourceGeneratedBytes=${linkedBytesTotal}, output=${manifest.output}, sha256=${rebuiltSha256}`,
  );
}

function runVerifier(stateFile: string, unitPath: string): void {
  const result = spawnSync("bun", ["decomp:verify-linked-unit", stateFile, unitPath], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Linked unit verifier failed for ${unitPath} with exit code ${result.status}`);
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
      throw new Error(`Linked unit ${path} overlaps ${existing.path}`);
    }
  }
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
