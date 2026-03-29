/**
 * Probe: read duelist unlock status from PS1 RAM and print the results.
 *
 * Usage:
 *   cd bridge && bun debug/duelist-unlock-probe.ts
 */

const DUELIST_NAMES: Record<number, string> = {
  1: "Simon Muran",
  2: "Teana",
  3: "Jono",
  4: "Villager1",
  5: "Villager2",
  6: "Villager3",
  7: "Seto",
  8: "Heishin",
  9: "Rex Raptor",
  10: "Weevil Underwood",
  11: "Mai Valentine",
  12: "Bandit Keith",
  13: "Shadi",
  14: "Yami Bakura",
  15: "Pegasus",
  16: "Isis",
  17: "Kaiba",
  18: "Mage Soldier",
  19: "Jono 2nd",
  20: "Teana 2nd",
  21: "Ocean Mage",
  22: "Villager1 2nd",
  23: "Forest Mage",
  24: "Villager2 2nd",
  25: "Mountain Mage",
  26: "Villager3 2nd",
  27: "Desert Mage",
  28: "High Mage Martis",
  29: "Meadow Mage",
  30: "High Mage Kepura",
  31: "Labyrinth Mage",
  32: "Seto 2nd",
  33: "Guardian Sebek",
  34: "Guardian Neku",
  35: "Heishin 2nd",
  36: "Seto 3rd",
  37: "DarkNite",
  38: "Nitemare",
  39: "Duel Master K",
};

const DUELIST_UNLOCK_OFFSET = 0x1d06f4;
const PROBE_BYTES = 8; // read extra in case >4 bytes

if (import.meta.main) {
  const { findDuckStationPids, openSharedMemory, isGameLoaded } = await import("../memory.ts");

  const pids = await findDuckStationPids();
  if (pids.length === 0) {
    console.error("No DuckStation process found");
    process.exit(1);
  }

  const pid = pids[0];
  if (pid === undefined) {
    console.error("No DuckStation process found");
    process.exit(1);
  }

  const mapping = openSharedMemory(pid);
  if (!mapping) {
    console.error("Failed to open shared memory");
    process.exit(1);
  }

  if (!isGameLoaded(mapping.view)) {
    console.error("Game not loaded in DuckStation");
    process.exit(1);
  }

  const view = mapping.view;

  // Read raw bytes
  const bytes: number[] = [];
  for (let i = 0; i < PROBE_BYTES; i++) {
    bytes.push(view.getUint8(DUELIST_UNLOCK_OFFSET + i));
  }

  console.log(
    `Raw bytes at 0x${DUELIST_UNLOCK_OFFSET.toString(16)}: ${bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}`,
  );
  console.log(`Binary:  ${bytes.map((b) => b.toString(2).padStart(8, "0")).join(" ")}`);

  // Try decoding as bitfield: bit N (0-indexed) = duelist ID N+1
  console.log("\n--- Bitfield decode (bit N = duelist N+1) ---");
  const unlocked: string[] = [];
  const locked: string[] = [];
  for (let duelistId = 1; duelistId <= 39; duelistId++) {
    const bitIdx = duelistId - 1;
    const byteIdx = Math.floor(bitIdx / 8);
    const bitInByte = bitIdx % 8;
    const byteVal = bytes[byteIdx] ?? 0;
    const isSet = (byteVal & (1 << bitInByte)) !== 0;
    const name = DUELIST_NAMES[duelistId] ?? `Duelist #${duelistId}`;
    if (isSet) {
      unlocked.push(`  ${duelistId.toString().padStart(2)}. ${name}`);
    } else {
      locked.push(`  ${duelistId.toString().padStart(2)}. ${name}`);
    }
  }

  console.log(`\nUnlocked (${unlocked.length}):`);
  for (const line of unlocked) console.log(line);

  console.log(`\nLocked (${locked.length}):`);
  for (const line of locked) console.log(line);
}
