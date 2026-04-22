// Reads Bakura's (duelist id=8) S/A-POW pool from both candidate ISOs and
// reports the top-attack entries. Tells us which ISO the UI edits actually
// landed on.

import { detectAttributeMapping, detectExeLayout } from "../bridge/extract/detect-exe.ts";
import { detectWaMrgLayout } from "../bridge/extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "../bridge/extract/detect-wamrg-text.ts";
import { extractCards } from "../bridge/extract/extract-cards.ts";
import { extractDuelists } from "../bridge/extract/extract-duelists.ts";
import { langIdxForSerial, loadDiscData } from "../bridge/extract/index.ts";

const ISOS = [
  "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Yu-Gi-Oh! Alpha Mod (Drop x15).iso",
  "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Yu-Gi-Oh! Alpha Mod (Drop x15) — BEWD test.iso",
];

for (const path of ISOS) {
  console.log(`\n=== ${path.split("/").pop()} ===`);
  const { slus, waMrg, serial } = loadDiscData(path);
  const exeLayout = detectExeLayout(slus);
  const waMrgLayout = detectWaMrgLayout(waMrg);
  const langIdx = langIdxForSerial(serial);
  const cardAttributes = detectAttributeMapping(slus, exeLayout, langIdx);
  const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];
  const cards = extractCards(
    slus,
    waMrg,
    exeLayout,
    waMrgLayout,
    cardAttributes,
    waMrgTextBlocks,
    langIdx,
  );
  const duelists = extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks, langIdx);

  const bakura = duelists.find((d) => d.id === 8);
  if (!bakura) {
    console.log("Bakura (id=8) not found");
    continue;
  }
  console.log(`Duelist #${bakura.id}: ${bakura.name.trim()}`);
  const TOTAL = 2048;

  // Top entries of saPow with ATK >= 2000, sorted by weight desc
  type Row = { id: number; name: string; atk: number; weight: number };
  const rows: Row[] = [];
  for (let i = 0; i < bakura.saPow.length; i++) {
    const w = bakura.saPow[i] ?? 0;
    if (w === 0) continue;
    const card = cards[i];
    if (!card) continue;
    if (card.atk < 2000) continue;
    rows.push({ id: card.id, name: card.name.trim(), atk: card.atk, weight: w });
  }
  rows.sort((a, b) => b.weight - a.weight);

  console.log(`saPow nonzero cards with ATK >= 2000: ${rows.length}`);
  for (const r of rows.slice(0, 15)) {
    const pct = ((r.weight / TOTAL) * 100).toFixed(2);
    console.log(
      `  #${String(r.id).padStart(3, "0")} ${r.name.padEnd(30)} ATK=${r.atk}  w=${r.weight}  ${pct}%`,
    );
  }
}
