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
import { PAL_PROFILE, peekU8 } from "../memory.ts";

// ── Region definitions ─────────────────────────────────────────────

interface Region {
  name: string;
  base: number;
  len: number;
}

/**
 * Build wide snapshot regions for PAL investigation.
 * NTSC-U relative offsets don't apply to PAL, so we scan broader ranges.
 */
function buildRegions(): Region[] {
  const phase = PAL_PROFILE.duelPhase; // 0x09C564
  const lp = PAL_PROFILE.lpP1; // 0x0EB28A
  return [
    // Wide region around phase for scene ID search.
    // Scene ID was NOT found in phase-0x20..+0x100, so cover a much bigger range.
    // Covers turn indicator (phase-0x60) through phase+0x400.
    { name: "wide_phase", base: phase - 0x100, len: 0x500 },
    // Duelist ID + terrain: confirmed candidates near phase+0x180..+0x190
    { name: "duelist_terrain", base: phase + 0x80, len: 0x180 },
    // Fusion counter: confirmed at lp-0x0B. Keep scanning for verification.
    { name: "fusion", base: lp - 0x40, len: 0x60 },
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
    if (!a || !b) continue;
    const changes: ByteChange[] = [];
    for (let i = 0; i < a.length; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) changes.push({ addr: r.base + i, prev: av, curr: bv });
    }
    if (changes.length > 0) {
      console.log(`[diag] ${label} | ${r.name} (${changes.length} changes):`);
      for (const c of changes) {
        console.log(
          `[diag]   0x${c.addr.toString(16).padStart(6, "0")}` +
            ` (phase${c.addr >= PAL_PROFILE.duelPhase ? "+" : ""}${(c.addr - PAL_PROFILE.duelPhase).toString(16)}):` +
            ` ${c.prev} → ${c.curr}`,
        );
      }
    }
  }
}

/** Hex dump a region, 16 bytes per line with address and ASCII. */
function hexDump(view: DataView, base: number, len: number, label: string): void {
  console.log(
    `[diag] === HEX DUMP: ${label} (0x${base.toString(16)}..0x${(base + len).toString(16)}) ===`,
  );
  const phase = PAL_PROFILE.duelPhase;
  for (let off = 0; off < len; off += 16) {
    const addr = base + off;
    const relPhase = addr - phase;
    const hex: string[] = [];
    const ascii: string[] = [];
    for (let i = 0; i < 16 && off + i < len; i++) {
      const b = peekU8(view, addr + i);
      hex.push(b.toString(16).padStart(2, "0"));
      ascii.push(b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".");
    }
    const relStr = relPhase >= 0 ? `+${relPhase.toString(16)}` : relPhase.toString(16);
    console.log(
      `[diag] ${addr.toString(16).padStart(6, "0")} (${relStr.padStart(5)}): ${hex.join(" ")}  ${ascii.join("")}`,
    );
  }
}

/** Log candidate values at discovered and candidate offsets. */
function logProbes(view: DataView): void {
  const l = PAL_PROFILE.lpP1;
  const handSize = peekU8(view, l + 0x06);
  const slots: string[] = [];
  for (let i = 0; i < 5; i++) {
    const v = peekU8(view, l + 0x08 + i);
    slots.push(v === 255 ? "FF" : String(v));
  }
  console.log(
    `[diag] hand: size=${handSize} slots=[${slots.join(",")}]` + ` fus=${peekU8(view, l - 0x0b)}`,
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
 * Also takes periodic snapshots to catch scene changes during menu navigation
 * (PAL phase stays 0x0D after duel, so normal exit detection doesn't work).
 */
export function createPalProbe(): PalProbe {
  const regions = buildRegions();
  let snap: Snap | null = null;
  let snapLabel = "";
  let wasInDuel = false;
  let lastPhase: number | null = null;
  let duelN = 0;
  let dumpedThisSession = false;
  let lastPeriodicMs = 0;
  let periodicCount = 0;

  function onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void {
    if (profile?.label !== "PAL") return;

    const inDuel = state.duelPhase != null && state.duelPhase >= 0x01 && state.duelPhase <= 0x0d;

    // Detect duel boundary: phase jumps from end-of-duel (0x0C/0x0D) back to
    // early phase (0x01-0x04). PAL phase byte stays 0x0D after leaving the
    // results screen, so the normal exit detection never fires.
    const isDuelReset =
      inDuel &&
      wasInDuel &&
      lastPhase != null &&
      lastPhase >= 0x0c &&
      state.duelPhase != null &&
      state.duelPhase <= 0x04;

    if (isDuelReset) {
      const s = takeSnapshot(view, regions);
      if (snap) diffSnapshots(snap, s, `EXIT(reset) duel#${duelN}`, regions);
      snap = s;
      snapLabel = `post-duel#${duelN}`;
      console.log(`[diag] === Duel #${duelN} ended (reset detected) ===`);
      logProbes(view);
      wasInDuel = false;
    }

    // Entering duel
    if (inDuel && !wasInDuel) {
      duelN++;
      const s = takeSnapshot(view, regions);
      if (snap) diffSnapshots(snap, s, `ENTER duel#${duelN} vs ${snapLabel}`, regions);
      snap = s;
      snapLabel = `duel#${duelN}-enter`;
      console.log(
        `[diag] === Duel #${duelN} started (phase=0x${state.duelPhase?.toString(16)}) ===`,
      );
      logProbes(view);

      if (!dumpedThisSession) {
        dumpedThisSession = true;
        const phase = PAL_PROFILE.duelPhase;
        const lp = PAL_PROFILE.lpP1;
        hexDump(view, phase - 0x100, 0x500, "WIDE PHASE (phase-0x100 to phase+0x400)");
        hexDump(view, lp - 0x40, 0x60, "LP region (lp-0x40 to lp+0x20)");
      }
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

    // Leaving duel (normal — may not fire on PAL)
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

    // ── Periodic snapshot (every 10s) for scene ID discovery ──────
    // PAL phase stays 0x0D after duel, so we take periodic snapshots
    // to capture scene changes during menu navigation.
    const now = Date.now();
    if (snap && now - lastPeriodicMs > 10_000 && periodicCount < 30) {
      lastPeriodicMs = now;
      periodicCount++;
      const s = takeSnapshot(view, regions);
      const changes: string[] = [];
      for (const r of regions) {
        const a = snap[r.name];
        const b = s[r.name];
        if (!a || !b) continue;
        let n = 0;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
        if (n > 0) changes.push(`${r.name}:${n}`);
      }
      if (changes.length > 0) {
        console.log(`[diag] PERIODIC #${periodicCount} (${changes.join(", ")}):`);
        diffSnapshots(snap, s, `PERIODIC #${periodicCount}`, regions);
        snap = s;
        snapLabel = `periodic#${periodicCount}`;
      }
    }

    wasInDuel = inDuel;
    lastPhase = state.duelPhase;
  }

  return { onStateChange };
}
