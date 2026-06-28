import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

interface DecompState {
  schemaVersion: 1;
  target: {
    serial: string | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    extractedExePath: string | null;
  };
}

interface LinkedUnit {
  schemaVersion: 1;
  serial: string;
  name: string;
  evidenceClass: "linked_executable";
  sourceType: "mips_asm_linked";
  source: string;
  linkerScript: string;
  section: string;
  range: {
    fileStart: number;
    fileEnd: number;
    ramStart: number;
    ramEnd: number;
    size: number;
  };
  outputs: {
    object: string;
    elf: string;
    unitBinary: string;
    executable: string;
  };
}

interface Toolchain {
  env: NodeJS.ProcessEnv;
  tool: (name: string) => string;
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const unitPath =
  process.argv[3] ?? "decomp/linked-units/SLUS_014.11/entrypoint-init-linked-v0.json";

verifyLinkedUnit(statePath, unitPath);

function verifyLinkedUnit(stateFile: string, linkedUnitFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const unit = readJson<LinkedUnit>(linkedUnitFile);
  const serial = required(state.target.serial, "target.serial");
  const extractedExePath = required(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = required(state.target.exeSha256, "target.exeSha256");
  const loadAddress = required(state.target.exeLoadAddr, "target.exeLoadAddr");
  const toolchain = resolveToolchain();

  verifyUnit(unit, serial, loadAddress);
  if (!existsSync(unit.source)) throw new Error(`Assembly source not found: ${unit.source}`);
  if (!existsSync(unit.linkerScript))
    throw new Error(`Linker script not found: ${unit.linkerScript}`);
  if (!existsSync(extractedExePath))
    throw new Error(`Extracted executable not found: ${extractedExePath}`);

  mkdirSync(dirname(unit.outputs.object), { recursive: true });
  runTool(toolchain, "as", [
    "-EL",
    "-march=r3000",
    "-mabi=32",
    "-o",
    unit.outputs.object,
    unit.source,
  ]);
  runTool(toolchain, "ld", [
    "-EL",
    "-T",
    unit.linkerScript,
    "-o",
    unit.outputs.elf,
    unit.outputs.object,
  ]);
  runTool(toolchain, "objcopy", [
    "-O",
    "binary",
    "-j",
    unit.section,
    unit.outputs.elf,
    unit.outputs.unitBinary,
  ]);

  verifyLinkedSection(toolchain, unit);
  const original = readFileSync(extractedExePath);
  assertEqual(sha256(original), expectedExeSha256, "original extracted executable SHA-256");

  const linkedBytes = readFileSync(unit.outputs.unitBinary);
  const originalBytes = original.subarray(unit.range.fileStart, unit.range.fileEnd);
  assertEqual(linkedBytes.length, unit.range.size, `${unit.name}.linked byte size`);
  assertEqual(
    linkedBytes.toString("hex"),
    originalBytes.toString("hex"),
    `${unit.name}.linked bytes vs original executable`,
  );

  const rebuilt = Buffer.from(original);
  linkedBytes.copy(rebuilt, unit.range.fileStart);
  assertEqual(sha256(rebuilt), expectedExeSha256, "linked rebuilt executable SHA-256");
  writeFileSync(unit.outputs.executable, rebuilt);
  console.log(
    `Verified linked unit ${linkedUnitFile}: section=${unit.section}, bytes=${unit.range.size}, output=${unit.outputs.executable}, sha256=${expectedExeSha256}`,
  );
}

function verifyUnit(unit: LinkedUnit, serial: string, loadAddress: number): void {
  assertEqual(unit.schemaVersion, 1, `${unit.name}.schemaVersion`);
  assertEqual(unit.serial, serial, `${unit.name}.serial`);
  assertEqual(unit.evidenceClass, "linked_executable", `${unit.name}.evidenceClass`);
  assertEqual(unit.sourceType, "mips_asm_linked", `${unit.name}.sourceType`);
  assertEqual(unit.range.fileEnd - unit.range.fileStart, unit.range.size, `${unit.name}.file size`);
  assertEqual(unit.range.ramEnd - unit.range.ramStart, unit.range.size, `${unit.name}.RAM size`);
  assertEqual(
    unit.range.fileStart,
    0x800 + (unit.range.ramStart - loadAddress),
    `${unit.name}.fileStart vs RAM`,
  );
}

function verifyLinkedSection(toolchain: Toolchain, unit: LinkedUnit): void {
  const objdump = runToolCapture(toolchain, "objdump", ["-h", unit.outputs.elf]);
  const section = parseSection(objdump, unit.section);
  assertEqual(section.size, unit.range.size, `${unit.name}.${unit.section} linked section size`);
  assertEqual(section.vma, unit.range.ramStart, `${unit.name}.${unit.section} linked VMA`);
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
