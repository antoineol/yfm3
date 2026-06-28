const REGISTERS: Record<string, number> = {
  zero: 0,
  at: 1,
  v0: 2,
  v1: 3,
  a0: 4,
  a1: 5,
  a2: 6,
  a3: 7,
  t0: 8,
  t1: 9,
  t2: 10,
  t3: 11,
  t4: 12,
  t5: 13,
  t6: 14,
  t7: 15,
  s0: 16,
  s1: 17,
  s2: 18,
  s3: 19,
  s4: 20,
  s5: 21,
  s6: 22,
  s7: 23,
  t8: 24,
  t9: 25,
  k0: 26,
  k1: 27,
  gp: 28,
  sp: 29,
  fp: 30,
  ra: 31,
};

export function encodeMipsInstructionLe(asm: string): Buffer {
  const { op, operands } = parseInstruction(asm);
  if (op === "lui") {
    if (operands.length !== 2) throw new Error(`Invalid lui operand count: ${asm}`);
    const rt = parseRegister(requiredOperand(operands, 0, asm));
    const imm = parseImmediate(requiredOperand(operands, 1, asm));
    return wordLe((0x0f << 26) | (rt << 16) | (imm & 0xffff));
  }
  if (op === "addiu") {
    if (operands.length !== 3) throw new Error(`Invalid addiu operand count: ${asm}`);
    const rt = parseRegister(requiredOperand(operands, 0, asm));
    const rs = parseRegister(requiredOperand(operands, 1, asm));
    const imm = parseImmediate(requiredOperand(operands, 2, asm));
    return wordLe((0x09 << 26) | (rs << 21) | (rt << 16) | (imm & 0xffff));
  }
  throw new Error(`Unsupported MIPS instruction: ${asm}`);
}

function parseInstruction(asm: string): { op: string; operands: string[] } {
  const trimmed = asm.trim();
  const match = trimmed.match(/^([a-z0-9]+)\s*(.*)$/i);
  if (!match?.[1]) throw new Error(`Invalid MIPS instruction: ${asm}`);
  const operands = (match[2] ?? "")
    .split(",")
    .map((operand) => operand.trim())
    .filter((operand) => operand.length > 0);
  return { op: match[1].toLowerCase(), operands };
}

function requiredOperand(operands: string[], index: number, asm: string): string {
  const operand = operands[index];
  if (!operand) throw new Error(`Missing operand ${index} in ${asm}`);
  return operand;
}

function parseRegister(value: string): number {
  const normalized = value.replace(/^\$/, "").toLowerCase();
  const register = REGISTERS[normalized];
  if (register === undefined) throw new Error(`Unknown MIPS register: ${value}`);
  return register;
}

function parseImmediate(value: string): number {
  const parsed = value.startsWith("0x") ? Number.parseInt(value, 16) : Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed)) throw new Error(`Invalid immediate: ${value}`);
  return parsed;
}

function wordLe(word: number): Buffer {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(word >>> 0);
  return out;
}
