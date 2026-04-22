import { readFileSync, writeFileSync } from "node:fs";
import {
  CARD_QUANTITY_COUNT,
  getAllCardQuantities,
  getStarchips,
  grantAllCards,
  loadSave,
  type Save,
  setCardQuantity,
  setStarchips,
  updateCrcs,
} from "../src/engine/savefile/save.ts";
import { CARDS, findCardByIdOrName, type VanillaCard } from "./vanilla-cards.ts";

const USAGE = `Usage: bun saveeditor/cli.ts <command> <save.mcd> [args]

Commands:
  dump <save>                       Print cards (owned only) + starchips as JSON.
  set-qty <save> <idOrIndex> <n>    Set quantity 0..255 for one card.
                                    idOrIndex = 3-digit vanilla card ID ("089"),
                                    exact card name, or 0-based index.
  set-starchips <save> <n>          Set starchips (0..16777215).
  all-cards <save> [n=1]            Grant n copies of every card (720 slots).
  crc <save>                        Recompute CRCs and rewrite the file in place.

Notes:
  Reads/writes raw PSX memcard dumps (.mcd / .mcr — same binary format).
  Only the first 720 trunk slots are addressable; that is the save's limit,
  not a port limitation.`;

type CommandHandler = (path: string, rest: readonly string[]) => number;

const COMMANDS: Readonly<Record<string, CommandHandler>> = {
  dump: handleDump,
  "set-qty": handleSetQty,
  "set-starchips": handleSetStarchips,
  "all-cards": handleAllCards,
  crc: handleCrc,
};

function main(argv: readonly string[]): number {
  const [cmd, path, ...rest] = argv;
  if (!cmd || !path) return fail();
  const handler = COMMANDS[cmd];
  if (!handler) return fail(`unknown command: ${cmd}`);
  try {
    return handler(path, rest);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`error: ${message}`);
    return 2;
  }
}

function fail(message?: string): number {
  if (message) console.error(`error: ${message}`);
  console.error(USAGE);
  return 1;
}

function openSave(path: string): Save {
  return loadSave(readFileSync(path));
}

function writeSave(path: string, save: Save): void {
  writeFileSync(path, save.bytes);
}

type OwnedCard = { index: number; id: string; name: string; quantity: number };

function handleDump(path: string): number {
  const save = openSave(path);
  const quantities = getAllCardQuantities(save);
  const owned: OwnedCard[] = [];
  for (let i = 0; i < CARD_QUANTITY_COUNT; i++) {
    const q = quantities[i];
    if (q === undefined || q === 0) continue;
    const card = CARDS[i];
    owned.push({
      index: i,
      id: card?.id ?? `#${i}`,
      name: card?.name ?? "(unknown)",
      quantity: q,
    });
  }
  console.log(JSON.stringify({ starchips: getStarchips(save), owned }, null, 2));
  return 0;
}

function handleSetQty(path: string, rest: readonly string[]): number {
  const [idOrIndex, qtyStr] = rest;
  if (!idOrIndex || !qtyStr) return fail("set-qty requires <idOrIndex> <n>");
  const resolved = resolveCardIndex(idOrIndex);
  const quantity = parseIntStrict(qtyStr, "quantity");
  const save = openSave(path);
  setCardQuantity(save, resolved.index, quantity);
  updateCrcs(save);
  writeSave(path, save);
  console.log(`set card ${resolved.index} (${resolved.card?.name ?? "?"}) = ${quantity}`);
  return 0;
}

function handleSetStarchips(path: string, rest: readonly string[]): number {
  const [valStr] = rest;
  if (!valStr) return fail("set-starchips requires <n>");
  const value = parseIntStrict(valStr, "starchips");
  const save = openSave(path);
  setStarchips(save, value);
  updateCrcs(save);
  writeSave(path, save);
  console.log(`set starchips = ${value}`);
  return 0;
}

function handleAllCards(path: string, rest: readonly string[]): number {
  const qty = rest[0] ? parseIntStrict(rest[0], "quantity") : 1;
  const save = openSave(path);
  grantAllCards(save, qty);
  updateCrcs(save);
  writeSave(path, save);
  console.log(`granted ${qty}x every card (${CARD_QUANTITY_COUNT} slots)`);
  return 0;
}

function handleCrc(path: string): number {
  const save = openSave(path);
  updateCrcs(save);
  writeSave(path, save);
  console.log("CRCs updated");
  return 0;
}

function resolveCardIndex(token: string): { index: number; card: VanillaCard | undefined } {
  const byIdOrName = findCardByIdOrName(token);
  if (byIdOrName) return { index: byIdOrName.index, card: byIdOrName };
  const asInt = Number.parseInt(token, 10);
  if (!Number.isFinite(asInt) || asInt < 0 || asInt >= CARD_QUANTITY_COUNT) {
    throw new Error(`could not resolve "${token}" to a card index or name`);
  }
  return { index: asInt, card: CARDS[asInt] };
}

function parseIntStrict(token: string, label: string): number {
  const n = Number.parseInt(token, 10);
  if (!Number.isFinite(n) || String(n) !== token.trim()) {
    throw new Error(`${label} must be an integer, got "${token}"`);
  }
  return n;
}

process.exit(main(process.argv.slice(2)));
