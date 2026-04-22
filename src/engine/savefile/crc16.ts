/**
 * CRC16-CCITT (XMODEM variant): polynomial 0x1021, init 0x0000, no reflection, no XOR-out.
 * Faithful port of `Crc16/CalculateCustomCRC.cs` from ThatPlayer2/Yu-Gi-Oh-Forbidden-Memories.
 */
export function crc16Ccitt(data: Uint8Array, offset: number, length: number): number {
  const polynomial = 0x1021;
  let crc = 0x0000;
  for (let i = 0; i < length; i++) {
    const byte = data[offset + i];
    if (byte === undefined) throw new RangeError(`crc16Ccitt: out-of-range index ${offset + i}`);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ polynomial) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc & 0xffff;
}
