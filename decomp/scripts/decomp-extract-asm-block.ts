import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const REGISTER_NAMES = [
  "zero",
  "at",
  "v0",
  "v1",
  "a0",
  "a1",
  "a2",
  "a3",
  "t0",
  "t1",
  "t2",
  "t3",
  "t4",
  "t5",
  "t6",
  "t7",
  "s0",
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "t8",
  "t9",
  "k0",
  "k1",
  "gp",
  "sp",
  "fp",
  "ra",
];

interface DisasmInstruction {
  address: number;
  word: string;
  asm: string;
}

const [disasmPath, startText, endText, sectionName, symbolName, outputPath] = process.argv.slice(2);

if (!disasmPath || !startText || !endText || !sectionName || !symbolName || !outputPath) {
  throw new Error(
    "Usage: bun decomp:slice-asm <disasm.asm> <start-ram> <end-ram> <section-name> <symbol-name> <output.s>",
  );
}

const start = parseAddress(startText, "start-ram");
const end = parseAddress(endText, "end-ram");
if (start >= end) throw new Error(`Invalid range: ${startText}..${endText}`);

const instructions = readInstructions(disasmPath, start, end);
if (instructions.length === 0) throw new Error(`No instructions found in ${disasmPath}`);
const expectedCount = (end - start) / 4;
if (instructions.length !== expectedCount) {
  throw new Error(`Range has ${instructions.length} instructions, expected ${expectedCount}`);
}

const addresses = new Set(instructions.map((instruction) => instruction.address));
const output = renderAssembly(instructions, addresses, sectionName, symbolName);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output);
console.log(
  `Wrote ${outputPath}: ${instructions.length} instructions, ${end - start} bytes, range=${hex(start)}..${hex(end)}`,
);

function readInstructions(path: string, rangeStart: number, rangeEnd: number): DisasmInstruction[] {
  const instructions: DisasmInstruction[] = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([0-9a-f]{8}):\s+([0-9a-f]{8})\s+(.+)$/i);
    if (!match?.[1] || !match[2] || !match[3]) continue;
    const address = Number.parseInt(match[1], 16);
    if (address < rangeStart || address >= rangeEnd) continue;
    instructions.push({ address, word: match[2], asm: normalizeInstruction(match[3]) });
  }
  return instructions;
}

function renderAssembly(
  instructions: DisasmInstruction[],
  addresses: Set<number>,
  sectionName: string,
  symbolName: string,
): string {
  const lines = [
    ".set noreorder",
    ".set noat",
    "",
    `.section ${sectionName},"ax",@progbits`,
    ".align 2",
    `.global ${symbolName}`,
    "",
    `${symbolName}:`,
  ];
  for (const instruction of instructions) {
    lines.push(`${label(instruction.address)}:`);
    lines.push(`  ${formatInstruction(instruction, addresses)}`);
  }
  lines.push("");
  return `${lines.join("\n")}`;
}

function normalizeInstruction(asm: string): string {
  return asm
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function formatInstruction(instruction: DisasmInstruction, addresses: Set<number>): string {
  if (/^(?:op|R-fn)=0x[0-9a-f]+$/i.test(instruction.asm)) {
    return `.word 0x${instruction.word.toLowerCase()}`;
  }
  if (/^divu? \w+, \w+$/i.test(instruction.asm)) {
    return `.word 0x${instruction.word.toLowerCase()}`;
  }

  let formatted = instruction.asm.replace(/\b0x[0-9a-f]{8}\b/gi, (value) => {
    const address = Number.parseInt(value.slice(2), 16);
    return addresses.has(address) ? label(address) : value.toLowerCase();
  });

  for (const register of REGISTER_NAMES) {
    formatted = formatted.replace(new RegExp(`(?<![$\\w])${register}(?!\\w)`, "g"), `$${register}`);
  }
  return formatted;
}

function parseAddress(value: string, label: string): number {
  const parsed = value.startsWith("0x")
    ? Number.parseInt(value.slice(2), 16)
    : Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed)) throw new Error(`Invalid ${label}: ${value}`);
  if (parsed % 4 !== 0) throw new Error(`${label} is not word-aligned: ${value}`);
  return parsed;
}

function label(address: number): string {
  return `L${hex(address).slice(2)}`;
}

function hex(value: number): string {
  return `0x${value.toString(16).padStart(8, "0")}`;
}
