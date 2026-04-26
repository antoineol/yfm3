// Quick MIPS R3000 little-endian disassembler.
// Reads a PSX SLUS file (header + text) and writes one line per word
// in the alpha-slus.asm format: "<ramaddr>: <hex_word> \t<mnemonic>".
import fs from "node:fs";

const REGS = [
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
function decode(word: number, ram: number): string {
  if (word === 0) return "sll\tzero,zero,0x0";
  const op = (word >>> 26) & 0x3f;
  const rs = (word >>> 21) & 0x1f;
  const rt = (word >>> 16) & 0x1f;
  const rd = (word >>> 11) & 0x1f;
  const sh = (word >>> 6) & 0x1f;
  const fn = word & 0x3f;
  const imm = word & 0xffff;
  const sImm = imm >= 0x8000 ? imm - 0x10000 : imm;
  if (op === 0) {
    if (fn === 0) return `sll\t${REGS[rd]},${REGS[rt]},0x${sh.toString(16)}`;
    if (fn === 2) return `srl\t${REGS[rd]},${REGS[rt]},0x${sh.toString(16)}`;
    if (fn === 3) return `sra\t${REGS[rd]},${REGS[rt]},0x${sh.toString(16)}`;
    if (fn === 4) return `sllv\t${REGS[rd]},${REGS[rt]},${REGS[rs]}`;
    if (fn === 6) return `srlv\t${REGS[rd]},${REGS[rt]},${REGS[rs]}`;
    if (fn === 7) return `srav\t${REGS[rd]},${REGS[rt]},${REGS[rs]}`;
    if (fn === 8) return `jr\t${REGS[rs]}`;
    if (fn === 9) return `jalr\t${REGS[rd]},${REGS[rs]}`;
    if (fn === 0x10) return `mfhi\t${REGS[rd]}`;
    if (fn === 0x11) return `mthi\t${REGS[rs]}`;
    if (fn === 0x12) return `mflo\t${REGS[rd]}`;
    if (fn === 0x13) return `mtlo\t${REGS[rs]}`;
    if (fn === 0x18) return `mult\t${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x19) return `multu\t${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x1a) return `div\t${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x1b) return `divu\t${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x20) return `add\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x21) return `addu\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x22) return `sub\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x23) return `subu\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x24) return `and\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x25) return `or\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x26) return `xor\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x27) return `nor\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x2a) return `slt\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    if (fn === 0x2b) return `sltu\t${REGS[rd]},${REGS[rs]},${REGS[rt]}`;
    return `R-fn=0x${fn.toString(16)}`;
  }
  if (op === 1) {
    const target = (ram + 4 + sImm * 4) >>> 0;
    if (rt === 0) return `bltz\t${REGS[rs]},0x${target.toString(16)}`;
    if (rt === 1) return `bgez\t${REGS[rs]},0x${target.toString(16)}`;
    if (rt === 0x10) return `bltzal\t${REGS[rs]},0x${target.toString(16)}`;
    if (rt === 0x11) return `bgezal\t${REGS[rs]},0x${target.toString(16)}`;
    return `regimm-rt=0x${rt.toString(16)}`;
  }
  if (op === 2) {
    const tgt = (((ram + 4) & 0xf0000000) | ((word & 0x3ffffff) << 2)) >>> 0;
    return `j\t0x${tgt.toString(16)}`;
  }
  if (op === 3) {
    const tgt = (((ram + 4) & 0xf0000000) | ((word & 0x3ffffff) << 2)) >>> 0;
    return `jal\t0x${tgt.toString(16)}`;
  }
  const target = (ram + 4 + sImm * 4) >>> 0;
  if (op === 4) return `beq\t${REGS[rs]},${REGS[rt]},0x${target.toString(16)}`;
  if (op === 5) return `bne\t${REGS[rs]},${REGS[rt]},0x${target.toString(16)}`;
  if (op === 6) return `blez\t${REGS[rs]},0x${target.toString(16)}`;
  if (op === 7) return `bgtz\t${REGS[rs]},0x${target.toString(16)}`;
  if (op === 8) return `addi\t${REGS[rt]},${REGS[rs]},${sImm}`;
  if (op === 9) return `addiu\t${REGS[rt]},${REGS[rs]},${sImm}`;
  if (op === 0xa) return `slti\t${REGS[rt]},${REGS[rs]},${sImm}`;
  if (op === 0xb) return `sltiu\t${REGS[rt]},${REGS[rs]},${sImm}`;
  if (op === 0xc) return `andi\t${REGS[rt]},${REGS[rs]},0x${imm.toString(16)}`;
  if (op === 0xd) return `ori\t${REGS[rt]},${REGS[rs]},0x${imm.toString(16)}`;
  if (op === 0xe) return `xori\t${REGS[rt]},${REGS[rs]},0x${imm.toString(16)}`;
  if (op === 0xf) return `lui\t${REGS[rt]},0x${imm.toString(16)}`;
  if (op === 0x20) return `lb\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x21) return `lh\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x22) return `lwl\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x23) return `lw\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x24) return `lbu\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x25) return `lhu\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x26) return `lwr\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x28) return `sb\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x29) return `sh\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x2a) return `swl\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x2b) return `sw\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  if (op === 0x2e) return `swr\t${REGS[rt]},${sImm}(${REGS[rs]})`;
  return `op=0x${op.toString(16)}`;
}

const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error("Usage: bun scripts/disas-mips.ts <slus-with-header> <out-asm>");
  process.exit(1);
}
const buf = fs.readFileSync(inPath);
// PSX EXE: 0x800-byte header. Load addr at offset 0x18, text size at 0x1c.
const loadAddr = buf.readUInt32LE(0x18);
const textSize = buf.readUInt32LE(0x1c);
const textStart = 0x800;
const textEnd = textStart + textSize;
const out: string[] = [];
for (let off = textStart; off + 4 <= textEnd; off += 4) {
  const word = buf.readUInt32LE(off);
  const ram = (loadAddr + off - textStart) >>> 0;
  // alpha-slus.asm has bytes in big-endian word order: e.g. 06001724 (the actual word)
  // Actually re-checking alpha-slus.asm: "801aad74:	24170006 	addiu	s7,zero,6"
  // The hex is the actual word value (BE display of LE value), i.e. 0x24170006.
  const wordHex = word.toString(16).padStart(8, "0");
  out.push(`${ram.toString(16).padStart(8, "0")}:\t${wordHex} \t${decode(word, ram)}`);
}
fs.writeFileSync(outPath, `${out.join("\n")}\n`);
console.log(`Wrote ${outPath} (${out.length} instructions)`);
