import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parseBootExeName } from "../../bridge/extract/index.ts";
import {
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "../../bridge/extract/iso9660.ts";
import type { IsoFile } from "../../bridge/extract/types.ts";
import { discOffset } from "../../bridge/extract/write-iso.ts";

interface DecompState {
  schemaVersion: 1;
  target: {
    discPath: string | null;
    discSha256: string | null;
    serial: string | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    extractedExePath: string | null;
  };
}

interface ManualDiscProbe {
  schemaVersion: 1;
  serial: string;
  name: string;
  evidenceClass: "behavioral_equivalence";
  sourceType: "mips_asm_linked_behavioral";
  source: string;
  linkerScript: string;
  section: string;
  expectedLogText?: string;
  range: {
    fileStart: number;
    fileEnd: number;
    ramStart: number;
    ramEnd: number;
    size: number;
  };
  expectedChanges: ExpectedChange[];
  outputs: {
    object: string;
    elf: string;
    unitBinary: string;
    executable: string;
    discBin: string;
    discCue: string;
  };
}

interface ExpectedChange {
  fileOffset: number;
  ram: number;
  originalWordLe: string;
  replacementWordLe: string;
  reason: string;
}

interface Toolchain {
  env: NodeJS.ProcessEnv;
  tool: (name: string) => string;
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const probePath =
  process.argv[3] ?? "decomp/manual-tests/SLUS_014.11/bootstrap-nop-variant-v0.json";

buildManualDisc(statePath, probePath);

function buildManualDisc(stateFile: string, probeFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const probe = readJson<ManualDiscProbe>(probeFile);
  const serial = required(state.target.serial, "target.serial");
  const discPath = required(state.target.discPath, "target.discPath");
  const expectedDiscSha256 = required(state.target.discSha256, "target.discSha256");
  const extractedExePath = required(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = required(state.target.exeSha256, "target.exeSha256");
  const loadAddress = required(state.target.exeLoadAddr, "target.exeLoadAddr");
  const toolchain = resolveToolchain();

  verifyProbe(probe, serial, loadAddress);
  assembleProbe(toolchain, probe);

  const originalExe = readFileSync(extractedExePath);
  assertEqual(sha256(originalExe), expectedExeSha256, "original extracted executable SHA-256");
  const linkedBytes = readFileSync(probe.outputs.unitBinary);
  const originalRange = originalExe.subarray(probe.range.fileStart, probe.range.fileEnd);
  verifyExpectedChanges(probe, originalRange, linkedBytes, loadAddress);

  const rebuiltExe = Buffer.from(originalExe);
  linkedBytes.copy(rebuiltExe, probe.range.fileStart);
  const rebuiltExeSha256 = sha256(rebuiltExe);
  if (rebuiltExeSha256 === expectedExeSha256) {
    throw new Error("Manual probe executable unexpectedly matches the original executable hash");
  }
  writeFileSync(probe.outputs.executable, rebuiltExe);

  const originalDisc = readFileSync(discPath);
  assertEqual(sha256(originalDisc), expectedDiscSha256, "original disc SHA-256");
  const rebuiltDisc = Buffer.from(originalDisc);
  const fmt = detectDiscFormat(rebuiltDisc);
  const exeEntry = findExecutableEntry(rebuiltDisc, fmt);
  assertEqual(exeEntry.name, serial, "disc executable name");
  assertEqual(exeEntry.size, rebuiltExe.length, "disc executable size");
  writeBytesToIsoFile(rebuiltDisc, exeEntry.sector, rebuiltExe, fmt);
  const rebuiltDiscSha256 = sha256(rebuiltDisc);
  if (rebuiltDiscSha256 === expectedDiscSha256) {
    throw new Error("Manual probe disc unexpectedly matches the original disc hash");
  }

  mkdirSync(dirname(probe.outputs.discBin), { recursive: true });
  writeFileSync(probe.outputs.discBin, rebuiltDisc);
  writeFileSync(
    probe.outputs.discCue,
    `FILE "${basename(probe.outputs.discBin)}" BINARY\r\n  TRACK 01 MODE2/2352\r\n    INDEX 01 00:00:00\r\n`,
  );

  console.log(
    `Built manual behavioral disc ${probe.outputs.discBin}: exeSha256=${rebuiltExeSha256}, discSha256=${rebuiltDiscSha256}, expectedChanges=${probe.expectedChanges.length}`,
  );
}

function verifyProbe(probe: ManualDiscProbe, serial: string, loadAddress: number): void {
  assertEqual(probe.schemaVersion, 1, `${probe.name}.schemaVersion`);
  assertEqual(probe.serial, serial, `${probe.name}.serial`);
  assertEqual(probe.evidenceClass, "behavioral_equivalence", `${probe.name}.evidenceClass`);
  assertEqual(probe.sourceType, "mips_asm_linked_behavioral", `${probe.name}.sourceType`);
  assertEqual(
    probe.range.fileEnd - probe.range.fileStart,
    probe.range.size,
    `${probe.name}.file size`,
  );
  assertEqual(
    probe.range.ramEnd - probe.range.ramStart,
    probe.range.size,
    `${probe.name}.RAM size`,
  );
  assertEqual(
    probe.range.fileStart,
    0x800 + (probe.range.ramStart - loadAddress),
    `${probe.name}.fileStart vs RAM`,
  );
  if (!existsSync(probe.source)) throw new Error(`Assembly source not found: ${probe.source}`);
  if (!existsSync(probe.linkerScript))
    throw new Error(`Linker script not found: ${probe.linkerScript}`);
  if (probe.expectedChanges.length === 0) throw new Error(`${probe.name}.expectedChanges is empty`);
  if (probe.expectedLogText !== undefined && probe.expectedLogText.trim() === "") {
    throw new Error(`${probe.name}.expectedLogText is empty`);
  }
}

function assembleProbe(toolchain: Toolchain, probe: ManualDiscProbe): void {
  mkdirSync(dirname(probe.outputs.object), { recursive: true });
  runTool(toolchain, "as", [
    "-EL",
    "-march=r3000",
    "-mabi=32",
    "-o",
    probe.outputs.object,
    probe.source,
  ]);
  runTool(toolchain, "ld", [
    "-EL",
    "-T",
    probe.linkerScript,
    "-o",
    probe.outputs.elf,
    probe.outputs.object,
  ]);
  runTool(toolchain, "objcopy", [
    "-O",
    "binary",
    "-j",
    probe.section,
    probe.outputs.elf,
    probe.outputs.unitBinary,
  ]);

  const section = parseSection(
    runToolCapture(toolchain, "objdump", ["-h", probe.outputs.elf]),
    probe.section,
  );
  assertEqual(section.size, probe.range.size, `${probe.name}.${probe.section} linked section size`);
  assertEqual(section.vma, probe.range.ramStart, `${probe.name}.${probe.section} linked VMA`);
}

function verifyExpectedChanges(
  probe: ManualDiscProbe,
  originalRange: Buffer,
  linkedBytes: Buffer,
  loadAddress: number,
): void {
  assertEqual(linkedBytes.length, probe.range.size, `${probe.name}.linked byte size`);
  const expected = Buffer.from(originalRange);
  for (const change of probe.expectedChanges) {
    if (change.reason.trim() === "") throw new Error("Expected change reason is empty");
    assertEqual(
      change.fileOffset,
      0x800 + (change.ram - loadAddress),
      `${probe.name}.expectedChanges fileOffset vs RAM`,
    );
    const relative = change.fileOffset - probe.range.fileStart;
    if (relative < 0 || relative + 4 > expected.length) {
      throw new Error(`Expected change is outside probe range: fileOffset=${change.fileOffset}`);
    }
    assertEqual(
      originalRange.subarray(relative, relative + 4).toString("hex"),
      change.originalWordLe,
      `${probe.name}.expected original word`,
    );
    assertEqual(
      linkedBytes.subarray(relative, relative + 4).toString("hex"),
      change.replacementWordLe,
      `${probe.name}.expected replacement word`,
    );
    Buffer.from(change.replacementWordLe, "hex").copy(expected, relative);
  }
  assertEqual(
    linkedBytes.toString("hex"),
    expected.toString("hex"),
    `${probe.name}.linked bytes vs expected manual-probe diff`,
  );
}

function findExecutableEntry(bin: Buffer, fmt: ReturnType<typeof detectDiscFormat>): IsoFile {
  const pvd = readSector(bin, PVD_SECTOR, fmt);
  const rootRecord = pvd.subarray(156, 190);
  const rootExtent = rootRecord.readUInt32LE(2);
  const rootSize = rootRecord.readUInt32LE(10);
  const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
  const rootFiles = parseDirectory(rootData, rootSize);
  const standard = rootFiles.find((file) => /^S[CL][A-Z]{2}_\d/.test(file.name));
  if (standard) return standard;

  const cnfEntry = rootFiles.find((file) => file.name === "SYSTEM.CNF");
  if (!cnfEntry) throw new Error("SYSTEM.CNF not found in disc image");
  const cnf = readSectors(bin, cnfEntry.sector, Math.ceil(cnfEntry.size / SECTOR_DATA_SIZE), fmt)
    .subarray(0, cnfEntry.size)
    .toString("ascii");
  const exeName = parseBootExeName(cnf)?.split("\\").pop()?.split("/").pop();
  const exeEntry = exeName ? rootFiles.find((file) => file.name === exeName) : null;
  if (!exeEntry) throw new Error("PS1 executable not found in disc image");
  return exeEntry;
}

function writeBytesToIsoFile(
  bin: Buffer,
  fileStartSector: number,
  bytes: Buffer,
  fmt: ReturnType<typeof detectDiscFormat>,
): void {
  for (let i = 0; i < bytes.length; i++) {
    bin[discOffset(fileStartSector, i, fmt)] = bytes[i] ?? 0;
  }
}

function parseSection(objdumpOutput: string, sectionName: string): { size: number; vma: number } {
  for (const line of objdumpOutput.split("\n")) {
    const columns = line.trim().split(/\s+/);
    if (columns[1] !== sectionName) continue;
    const sizeText = columns[2];
    const vmaText = columns[3];
    if (!sizeText || !vmaText) break;
    return { size: Number.parseInt(sizeText, 16), vma: Number.parseInt(vmaText, 16) };
  }
  throw new Error(`Linked section not found in objdump output: ${sectionName}`);
}

function resolveToolchain(): Toolchain {
  const localRoot = process.env.YFM3_MIPSEL_BINUTILS_ROOT ?? "decomp/toolchains/mipsel-binutils";
  const localBin = resolve(localRoot, "usr/bin");
  const localLib = resolve(localRoot, "usr/lib/x86_64-linux-gnu");
  const localAs = resolve(localBin, "mipsel-linux-gnu-as");
  if (existsSync(localAs)) {
    return {
      env: {
        ...process.env,
        LD_LIBRARY_PATH: prependPath(localLib, process.env.LD_LIBRARY_PATH),
      },
      tool: (name) => resolve(localBin, `mipsel-linux-gnu-${name}`),
    };
  }

  if (spawnSync("mipsel-linux-gnu-as", ["--version"], { stdio: "ignore" }).status === 0) {
    return { env: process.env, tool: (name) => `mipsel-linux-gnu-${name}` };
  }

  throw new Error(
    "Missing mipsel-linux-gnu binutils. Install binutils-mipsel-linux-gnu or extract it to decomp/toolchains/mipsel-binutils.",
  );
}

function runTool(toolchain: Toolchain, tool: string, args: string[]): void {
  const result = spawnSync(toolchain.tool(tool), args, {
    env: toolchain.env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${toolchain.tool(tool)} failed with exit code ${result.status}`);
  }
}

function runToolCapture(toolchain: Toolchain, tool: string, args: string[]): string {
  const result = spawnSync(toolchain.tool(tool), args, {
    encoding: "utf8",
    env: toolchain.env,
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `${toolchain.tool(tool)} failed with exit code ${result.status}: ${result.stderr}`,
    );
  }
  return result.stdout;
}

function prependPath(path: string, existing: string | undefined): string {
  return existing ? `${path}:${existing}` : path;
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
