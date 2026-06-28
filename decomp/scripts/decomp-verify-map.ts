import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parsePsxExeHeader } from "../../bridge/extract/detect-exe.ts";

interface DecompState {
  schemaVersion: 1;
  phase: string;
  target: {
    serial: string | null;
    exeSize: number | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    exeTextSize: number | null;
    extractedExePath: string | null;
  };
}

interface BoundaryMap {
  schemaVersion: 1;
  serial: string;
  exe: {
    fileSize: number;
    sha256: string;
    entrypoint: number;
    initialGp: number;
    loadAddress: number;
    payloadSize: number;
    stackPointer: number;
  };
  ranges: BoundaryRange[];
  functions?: FunctionBoundary[];
}

interface BoundaryRange {
  name: string;
  kind: "header" | "payload";
  fileStart: number;
  fileEnd: number;
  size: number;
  ramStart?: number;
  ramEnd?: number;
}

interface FunctionBoundary {
  name: string;
  kind: "entrypoint_bootstrap" | "function";
  fileStart: number;
  fileEnd: number;
  ramStart: number;
  ramEnd: number;
  size: number;
  boundaryEvidence: string;
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const mapPath = process.argv[3] ?? "decomp/maps/SLUS_014.11.json";

verifyBoundaryMap(statePath, mapPath);

function verifyBoundaryMap(stateFile: string, mapFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const map = readJson<BoundaryMap>(mapFile);
  const exePath = required(state.target.extractedExePath, "target.extractedExePath");
  if (!existsSync(exePath)) throw new Error(`Extracted executable not found: ${exePath}`);

  const exe = readFileSync(exePath);
  const header = parsePsxExeHeader(exe);
  const exeSha256 = sha256(exe);
  const entrypoint = exe.readUInt32LE(0x10);
  const initialGp = exe.readUInt32LE(0x14);
  const stackPointer = exe.readUInt32LE(0x30);

  assertEqual(map.schemaVersion, 1, "map.schemaVersion");
  assertEqual(map.serial, required(state.target.serial, "target.serial"), "map.serial");
  assertEqual(
    map.exe.fileSize,
    required(state.target.exeSize, "target.exeSize"),
    "map.exe.fileSize",
  );
  assertEqual(map.exe.fileSize, exe.length, "map.exe.fileSize vs extracted executable length");
  assertEqual(
    map.exe.sha256,
    required(state.target.exeSha256, "target.exeSha256"),
    "map.exe.sha256",
  );
  assertEqual(map.exe.sha256, exeSha256, "map.exe.sha256 vs extracted executable hash");
  assertEqual(map.exe.entrypoint, entrypoint, "map.exe.entrypoint");
  assertEqual(map.exe.initialGp, initialGp, "map.exe.initialGp");
  assertEqual(
    map.exe.loadAddress,
    required(state.target.exeLoadAddr, "target.exeLoadAddr"),
    "map.exe.loadAddress",
  );
  assertEqual(map.exe.loadAddress, header.loadAddr, "map.exe.loadAddress vs PS-X header");
  assertEqual(
    map.exe.payloadSize,
    required(state.target.exeTextSize, "target.exeTextSize"),
    "map.exe.payloadSize",
  );
  assertEqual(map.exe.payloadSize, header.textSize, "map.exe.payloadSize vs PS-X header");
  assertEqual(map.exe.stackPointer, stackPointer, "map.exe.stackPointer");

  const payload = verifyRanges(map);
  verifyFunctions(map, exe, payload);
  console.log(
    `Verified boundary map ${mapFile}: ${map.serial}, ${map.ranges.length} ranges, ${map.functions?.length ?? 0} functions, exeSha256=${exeSha256}`,
  );
}

function verifyRanges(map: BoundaryMap): BoundaryRange {
  const header = requiredRange(map, "psx_exe_header");
  assertEqual(header.kind, "header", "psx_exe_header.kind");
  assertEqual(header.fileStart, 0, "psx_exe_header.fileStart");
  assertEqual(header.fileEnd, 0x800, "psx_exe_header.fileEnd");
  assertEqual(header.size, 0x800, "psx_exe_header.size");

  const payload = requiredRange(map, "main_payload");
  assertEqual(payload.kind, "payload", "main_payload.kind");
  assertEqual(payload.fileStart, 0x800, "main_payload.fileStart");
  assertEqual(payload.fileEnd, map.exe.fileSize, "main_payload.fileEnd");
  assertEqual(payload.size, map.exe.payloadSize, "main_payload.size");
  assertEqual(payload.fileEnd - payload.fileStart, payload.size, "main_payload computed size");
  assertEqual(payload.ramStart, map.exe.loadAddress, "main_payload.ramStart");
  assertEqual(payload.ramEnd, map.exe.loadAddress + map.exe.payloadSize, "main_payload.ramEnd");

  assertEqual(header.fileEnd, payload.fileStart, "header/payload contiguity");
  if (map.exe.entrypoint < required(payload.ramStart, "main_payload.ramStart")) {
    throw new Error("map.exe.entrypoint is before main_payload RAM range");
  }
  if (map.exe.entrypoint >= required(payload.ramEnd, "main_payload.ramEnd")) {
    throw new Error("map.exe.entrypoint is after main_payload RAM range");
  }
  return payload;
}

function verifyFunctions(map: BoundaryMap, exe: Buffer, payload: BoundaryRange): void {
  const functions = map.functions ?? [];
  if (functions.length === 0) return;

  const sorted = [...functions].sort((left, right) => left.fileStart - right.fileStart);
  for (const boundary of sorted) {
    verifyFunctionBoundary(map, payload, boundary);
  }
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    if (!previous || !current) throw new Error(`Missing function boundary at index ${i}`);
    if (previous.fileEnd > current.fileStart) {
      throw new Error(`Function boundary overlap: ${previous.name} overlaps ${current.name}`);
    }
  }

  const bootstrap = requiredFunction(map, "entrypoint_bootstrap");
  assertEqual(bootstrap.kind, "entrypoint_bootstrap", "entrypoint_bootstrap.kind");
  assertEqual(bootstrap.ramStart, map.exe.entrypoint, "entrypoint_bootstrap.ramStart");
  assertEqual(bootstrap.size, 160, "entrypoint_bootstrap.size");

  const firstFunction = requiredFunction(map, "runtime_init_once");
  assertEqual(firstFunction.kind, "function", "runtime_init_once.kind");
  assertEqual(firstFunction.ramStart, bootstrap.ramEnd, "runtime_init_once starts after bootstrap");
  assertEqual(firstFunction.size, 112, "runtime_init_once.size");
  assertReturnShape(exe, firstFunction);
}

function verifyFunctionBoundary(
  map: BoundaryMap,
  payload: BoundaryRange,
  boundary: FunctionBoundary,
): void {
  assertEqual(boundary.fileEnd - boundary.fileStart, boundary.size, `${boundary.name}.file size`);
  assertEqual(boundary.ramEnd - boundary.ramStart, boundary.size, `${boundary.name}.RAM size`);
  assertEqual(
    boundary.fileStart,
    0x800 + (boundary.ramStart - map.exe.loadAddress),
    `${boundary.name}.fileStart vs RAM`,
  );
  if (boundary.fileStart % 4 !== 0 || boundary.fileEnd % 4 !== 0) {
    throw new Error(`${boundary.name} file range is not word-aligned`);
  }
  if (boundary.ramStart % 4 !== 0 || boundary.ramEnd % 4 !== 0) {
    throw new Error(`${boundary.name} RAM range is not word-aligned`);
  }
  if (boundary.fileStart < payload.fileStart || boundary.fileEnd > payload.fileEnd) {
    throw new Error(`${boundary.name} is outside main_payload`);
  }
  if (
    boundary.ramStart < required(payload.ramStart, "main_payload.ramStart") ||
    boundary.ramEnd > required(payload.ramEnd, "main_payload.ramEnd")
  ) {
    throw new Error(`${boundary.name} RAM range is outside main_payload`);
  }
  if (boundary.boundaryEvidence.trim() === "") {
    throw new Error(`${boundary.name}.boundaryEvidence is empty`);
  }
}

function assertReturnShape(exe: Buffer, boundary: FunctionBoundary): void {
  const returnWordOffset = boundary.fileEnd - 8;
  const delaySlotOffset = boundary.fileEnd - 4;
  assertEqual(exe.readUInt32LE(returnWordOffset), 0x03e00008, `${boundary.name}.return jr ra`);
  assertEqual(exe.readUInt32LE(delaySlotOffset), 0, `${boundary.name}.return delay slot`);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function required<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`Missing ${label}`);
  return value;
}

function requiredRange(map: BoundaryMap, name: string): BoundaryRange {
  const range = map.ranges.find((candidate) => candidate.name === name);
  if (!range) throw new Error(`Missing range ${name}`);
  return range;
}

function requiredFunction(map: BoundaryMap, name: string): FunctionBoundary {
  const boundary = map.functions?.find((candidate) => candidate.name === name);
  if (!boundary) throw new Error(`Missing function boundary ${name}`);
  return boundary;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
