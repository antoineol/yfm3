import { crc16Ccitt } from "./crc16.ts";

export const CARD_QUANTITY_OFFSET = 0x2250;
export const CARD_QUANTITY_COUNT = 720;
export const STARCHIPS_OFFSET = 0x27e0;
export const STARCHIPS_MAX = 0xffffff;
export const QUANTITY_MAX = 0xff;

type CrcRegion = {
  readonly start: number;
  readonly end: number;
  readonly storeMsb: number;
  readonly storeLsb: number;
  readonly zeroStart: number;
  readonly zeroEnd: number;
};

const CRC_REGIONS: readonly CrcRegion[] = [
  {
    start: 0x2200,
    end: 0x253d,
    storeMsb: 0x253e,
    storeLsb: 0x253f,
    zeroStart: 0x2540,
    zeroEnd: 0x257f,
  },
  {
    start: 0x2600,
    end: 0x27fd,
    storeMsb: 0x27fe,
    storeLsb: 0x27ff,
    zeroStart: 0x2800,
    zeroEnd: 0x282f,
  },
] as const;

const MIN_SAVE_BYTES = 0x2830;

export type Save = { bytes: Uint8Array };

export function loadSave(bytes: Uint8Array): Save {
  if (bytes.length < MIN_SAVE_BYTES) {
    throw new Error(
      `Save too small: got ${bytes.length} bytes, need >= ${MIN_SAVE_BYTES} (0x${MIN_SAVE_BYTES.toString(16)}).`,
    );
  }
  return { bytes: new Uint8Array(bytes) };
}

export function getCardQuantity(save: Save, index: number): number {
  assertCardIndex(index);
  return readByte(save.bytes, CARD_QUANTITY_OFFSET + index);
}

export function setCardQuantity(save: Save, index: number, quantity: number): void {
  assertCardIndex(index);
  assertByte(quantity, "quantity");
  save.bytes[CARD_QUANTITY_OFFSET + index] = quantity;
}

export function getAllCardQuantities(save: Save): Uint8Array {
  return save.bytes.slice(CARD_QUANTITY_OFFSET, CARD_QUANTITY_OFFSET + CARD_QUANTITY_COUNT);
}

export function getStarchips(save: Save): number {
  const b0 = readByte(save.bytes, STARCHIPS_OFFSET);
  const b1 = readByte(save.bytes, STARCHIPS_OFFSET + 1);
  const b2 = readByte(save.bytes, STARCHIPS_OFFSET + 2);
  return b0 | (b1 << 8) | (b2 << 16);
}

export function setStarchips(save: Save, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > STARCHIPS_MAX) {
    throw new RangeError(`starchips must be an integer in [0, ${STARCHIPS_MAX}], got ${value}`);
  }
  save.bytes[STARCHIPS_OFFSET] = value & 0xff;
  save.bytes[STARCHIPS_OFFSET + 1] = (value >> 8) & 0xff;
  save.bytes[STARCHIPS_OFFSET + 2] = (value >> 16) & 0xff;
}

export function grantAllCards(save: Save, quantity = 1): void {
  assertByte(quantity, "quantity");
  save.bytes.fill(quantity, CARD_QUANTITY_OFFSET, CARD_QUANTITY_OFFSET + CARD_QUANTITY_COUNT);
}

export function updateCrcs(save: Save): void {
  for (const region of CRC_REGIONS) applyCrcRegion(save.bytes, region);
}

function applyCrcRegion(bytes: Uint8Array, r: CrcRegion): void {
  const length = r.end - r.start + 1;
  const crc = crc16Ccitt(bytes, r.start, length);
  bytes[r.storeMsb] = (crc >> 8) & 0xff;
  bytes[r.storeLsb] = crc & 0xff;
  bytes.fill(0x00, r.zeroStart, r.zeroEnd + 1);
}

function assertCardIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= CARD_QUANTITY_COUNT) {
    throw new RangeError(
      `card index must be an integer in [0, ${CARD_QUANTITY_COUNT}), got ${index}`,
    );
  }
}

function assertByte(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > QUANTITY_MAX) {
    throw new RangeError(`${label} must be an integer in [0, ${QUANTITY_MAX}], got ${value}`);
  }
}

function readByte(bytes: Uint8Array, offset: number): number {
  const v = bytes[offset];
  if (v === undefined) {
    throw new RangeError(`save access out of range: 0x${offset.toString(16)}`);
  }
  return v;
}
