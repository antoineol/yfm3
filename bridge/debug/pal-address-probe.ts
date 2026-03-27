/**
 * PAL address investigation — snapshot-based diagnostic probing.
 *
 * Discovers remaining PAL RAM addresses (scene ID, duelist ID, terrain,
 * fusion counter) by taking memory snapshots at key game-state transitions
 * and diffing them.
 *
 * See docs/memory/pal-remaining-addresses.md for methodology.
 *
 * Usage from serve.ts:
 *
 *   import { createPalProbe } from "./debug/pal-address-probe.ts";
 *   const palProbe = createPalProbe();
 *
 *   // Inside poll loop, on state change:
 *   palProbe.onStateChange(view, state, profile);
 *
 * Set `palProbe = createPalProbe()` to reset state (e.g. on reconnect).
 * Set `palProbe = null` to disable.
 */

import type { GameState, OffsetProfile } from "../memory.ts";
import { PAL_PROFILE, peekU8, peekU16 } from "../memory.ts";

// ── Region definitions ─────────────────────────────────────────────

interface Region {
  name: string;
  base: number;
  len: number;
}

/**
 * Build the default snapshot regions for PAL investigation.
 * Regions are centered on known PAL addresses (phase, LP) and cover
 * the expected range for each unknown variable.
 */
function buildRegions(): Region[] {
  const phase = PAL_PROFILE.duelPhase; // 0x09C564
  const lp = PAL_PROFILE.lpP1; // 0x0EB28A
  return [
    // Scene ID (uint16): expected near phase+0x32 (NTSC-U relative)
    { name: "scene", base: phase + 0x10, len: 0x60 },
    // Duelist ID + terrain: expected near phase+0x127/+0x12A (NTSC-U relative)
    { name: "duelist_terrain", base: phase + 0x100, len: 0x80 },
    // Fusion counter: expected near LP-0x0C (NTSC-U relative)
    { name: "fusion", base: lp - 0x20, len: 0x40 },
  ];
}

// ── Snapshot types ─────────────────────────────────────────────────

/** A snapshot is a map from region name → byte array. */
type Snap = Record<string, number[]>;

interface ByteChange {
  addr: number;
  prev: number;
  curr: number;
}

// ── Core utilities (stateless, reusable) ───────────────────────────

/** Take a snapshot of all regions. */
function takeSnapshot(view: DataView, regions: Region[]): Snap {
  const snap: Snap = {};
  for (const r of regions) {
    const arr: number[] = [];
    for (let i = 0; i < r.len; i++) arr.push(peekU8(view, r.base + i));
    snap[r.name] = arr;
  }
  return snap;
}

/** Diff two snapshots and log changes per region. */
function diffSnapshots(prev: Snap, curr: Snap, label: string, regions: Region[]): void {
  for (const r of regions) {
    const a = prev[r.name];
    const b = curr[r.name];
    const changes: ByteChange[] = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) changes.push({ addr: r.base + i, prev: a[i], curr: b[i] });
    }
    if (changes.length > 0) {
      console.log(`[diag] ${label} | ${r.name} (${changes.length} changes):`);
      for (const c of changes) {
        console.log(`[diag]   0x${c.addr.toString(16)}: ${c.prev} → ${c.curr}`);
      }
    }
  }
}

/** Log high-probability candidate values at known NTSC-U relative offsets. */
function logProbes(view: DataView): void {
  const p = PAL_PROFILE.duelPhase;
  const l = PAL_PROFILE.lpP1;
  console.log(
    "[diag] probes:" +
      ` scn@+32=0x${peekU16(view, p + 0x32)
        .toString(16)
        .padStart(4, "0")}` +
      ` scn@+2D=0x${peekU16(view, p + 0x2d)
        .toString(16)
        .padStart(4, "0")}` +
      ` did@+127=${peekU8(view, p + 0x127)}` +
      ` did@+12C=${peekU8(view, p + 0x12c)}` +
      ` ter@+12A=${peekU8(view, p + 0x12a)}` +
      ` ter@+12F=${peekU8(view, p + 0x12f)}` +
      ` fus@lp-C=${peekU8(view, l - 0x0c)}`,
  );
}

// ── Stateful probe (created per session) ───────────────────────────

export interface PalProbe {
  /** Call on every state change in the poll loop. */
  onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void;
}

/**
 * Create a PAL address probe instance.
 * Tracks duel transitions and takes/diffs snapshots automatically.
 */
export function createPalProbe(): PalProbe {
  const regions = buildRegions();
  let snap: Snap | null = null;
  let snapLabel = "";
  let wasInDuel = false;
  let lastPhase: number | null = null;
  let duelN = 0;

  function onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void {
    if (profile?.label !== "PAL") return;

    const inDuel = state.duelPhase != null && state.duelPhase >= 0x01 && state.duelPhase <= 0x0d;

    // Entering duel
    if (inDuel && !wasInDuel) {
      duelN++;
      const s = takeSnapshot(view, regions);
      if (snap) diffSnapshots(snap, s, `ENTER duel#${duelN} vs ${snapLabel}`, regions);
      snap = s;
      snapLabel = `duel#${duelN}-enter`;
      console.log(`[diag] === Duel #${duelN} started ===`);
      logProbes(view);
    }

    // Fusion resolve (phase 0x08)
    if (inDuel && state.duelPhase === 0x08 && lastPhase !== 0x08) {
      const s = takeSnapshot(view, regions);
      if (snap) diffSnapshots(snap, s, `FUSION duel#${duelN}`, regions);
      snap = s;
      snapLabel = `duel#${duelN}-fusion`;
      console.log(`[diag] Fusion detected in duel #${duelN}`);
      logProbes(view);
    }

    // Leaving duel
    if (!inDuel && wasInDuel) {
      const s = takeSnapshot(view, regions);
      if (snap) diffSnapshots(snap, s, `EXIT duel#${duelN}`, regions);
      snap = s;
      snapLabel = `post-duel#${duelN}`;
      console.log(`[diag] === Duel #${duelN} ended ===`);
      logProbes(view);
    }

    // Phase change within duel — log probes
    if (inDuel && state.duelPhase !== lastPhase) {
      logProbes(view);
    }

    wasInDuel = inDuel;
    lastPhase = state.duelPhase;
  }

  return { onStateChange };
}
