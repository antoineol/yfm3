/**
 * Autonomous duel player with feedback loop.
 *
 * Read state → Decide action → Act → Read state → Verify
 *
 * Usage: node bridge/debug/play.cjs
 */

const net = require("node:net");
const { execSync } = require("node:child_process");
const path = require("node:path");
const WS = require("ws");

const BRIDGE_URL = "ws://172.28.48.1:3333";
const VIGEM_PORT = 7777;
const SS_SCRIPT = path.join(__dirname, "take-screenshot.ps1");

// ── Input ────────────────────────────────────────────────────────

function tap(btn) {
  return new Promise((resolve, reject) => {
    const c = net.connect(VIGEM_PORT, "127.0.0.1");
    c.on("connect", () => c.write(`tap ${btn}\n`));
    c.on("data", () => {
      c.end();
      resolve();
    });
    c.on("error", reject);
    setTimeout(() => reject(new Error("tap timeout")), 5000);
  });
}

function screenshot() {
  try {
    execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${SS_SCRIPT}"`, {
      timeout: 10000,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

// ── Bridge connection ────────────────────────────────────────────

let ws = null;
let state = null;
let cards = null; // card database from gameData

function connect() {
  return new Promise((resolve, reject) => {
    ws = new WS(BRIDGE_URL);
    ws.on("open", resolve);
    ws.on("error", reject);
    ws.on("message", (d) => {
      const msg = JSON.parse(d.toString());
      if (msg.type === "gameData" && msg.cards) cards = msg.cards;
      if ("duelPhase" in msg && msg.type !== "gameData") state = msg;
    });
    setTimeout(() => reject(new Error("connect timeout")), 5000);
  });
}

// ── State reading ────────────────────────────────────────────────

function cardName(id) {
  if (!cards) return `#${id}`;
  const c = cards.find((x) => x.id === id);
  return c ? c.name : `#${id}`;
}

function activeCards(arr) {
  return (arr || []).filter((c) => c.status & 0x80);
}

function describeState() {
  if (!state) return "no state";
  const phase = state.duelPhase;
  const turn = state.turnIndicator === 0 ? "PLAYER" : "OPPONENT";
  const hand = activeCards(state.hand);
  const field = activeCards(state.field);
  const oppField = activeCards(state.opponentField);
  const lp = state.lp;

  const phaseNames = {
    1: "INIT",
    2: "CLEANUP",
    3: "DRAW",
    4: "HAND_SELECT",
    5: "FIELD",
    7: "FUSION",
    8: "FUSION_RESOLVE",
    9: "BATTLE",
    10: "POST_BATTLE",
    12: "DUEL_END",
    13: "RESULTS",
  };

  const lines = [];
  lines.push(
    `Phase: ${phaseNames[phase] || phase} (${phase})  Turn: ${turn}  LP: ${lp[0]}/${lp[1]}`,
  );
  lines.push(
    `Hand (${hand.length}): ${hand.map((c) => `${cardName(c.cardId)}(${c.atk}/${c.def})`).join(", ")}`,
  );
  lines.push(
    `Field (${field.length}): ${field.map((c) => `${cardName(c.cardId)}(${c.atk}/${c.def})[0x${c.status.toString(16)}]`).join(", ")}`,
  );
  lines.push(
    `Opp Field (${oppField.length}): ${oppField.map((c) => `${cardName(c.cardId)}(${c.atk}/${c.def})[0x${c.status.toString(16)}]`).join(", ")}`,
  );
  return lines.join("\n");
}

// ── Wait for state to change ─────────────────────────────────────

function waitForStateChange(prevPhase, prevTurn, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = setInterval(() => {
      if (state && (state.duelPhase !== prevPhase || state.turnIndicator !== prevTurn)) {
        clearInterval(check);
        resolve(true);
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(check);
        resolve(false); // timed out, state didn't change
      }
    }, 100);
  });
}

// ── Action: tap and wait for effect ──────────────────────────────

async function act(btn, expectPhaseChange = false) {
  const prevPhase = state?.duelPhase;
  const prevTurn = state?.turnIndicator;
  const prevLP = state?.lp ? [...state.lp] : null;
  const prevHandCount = activeCards(state?.hand).length;
  const prevFieldCount = activeCards(state?.field).length;

  await tap(btn);

  if (expectPhaseChange) {
    await waitForStateChange(prevPhase, prevTurn, 3000);
  } else {
    await new Promise((r) => setTimeout(r, 500));
  }

  // Report what changed
  const changes = [];
  if (state?.duelPhase !== prevPhase) changes.push(`phase ${prevPhase}→${state.duelPhase}`);
  if (state?.turnIndicator !== prevTurn) changes.push("turn changed");
  if (prevLP && state?.lp && (state.lp[0] !== prevLP[0] || state.lp[1] !== prevLP[1])) {
    changes.push(`LP ${prevLP[0]}/${prevLP[1]}→${state.lp[0]}/${state.lp[1]}`);
  }
  const newHand = activeCards(state?.hand).length;
  const newField = activeCards(state?.field).length;
  if (newHand !== prevHandCount) changes.push(`hand ${prevHandCount}→${newHand}`);
  if (newField !== prevFieldCount) changes.push(`field ${prevFieldCount}→${newField}`);

  if (changes.length > 0) {
    console.log(`  ${btn} → ${changes.join(", ")}`);
  } else {
    console.log(`  ${btn} → no observable change`);
  }

  return changes.length > 0;
}

// ── Main duel loop ───────────────────────────────────────────────

async function main() {
  await connect();
  await new Promise((r) => setTimeout(r, 1000)); // wait for gameData + state

  console.log("=== DUEL START ===");
  console.log(describeState());
  console.log();

  let stuckCount = 0;
  const MaxStuck = 10;
  let turnCount = 0;

  for (let step = 0; step < 500; step++) {
    if (!state) {
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }

    const phase = state.duelPhase;
    const turn = state.turnIndicator;

    // Duel ended
    if (phase === 12 || phase === 13) {
      const result =
        state.lp[0] > state.lp[1] ? "WIN" : state.lp[0] < state.lp[1] ? "LOSS" : "DRAW";
      console.log(`\n=== DUEL ${result}! LP: ${state.lp[0]}/${state.lp[1]} ===`);
      // Spam cross to clear result dialogs
      for (let i = 0; i < 15; i++) {
        await tap("cross");
        await new Promise((r) => setTimeout(r, 400));
      }
      break;
    }

    // Opponent's turn — wait
    if (turn === 1) {
      await new Promise((r) => setTimeout(r, 300));
      stuckCount = 0;
      continue;
    }

    // Player's turn — decide based on phase
    let changed = false;

    switch (phase) {
      case 1: // INIT
      case 2: // CLEANUP
      case 3: // DRAW
        changed = await act("cross", true);
        break;

      case 4: {
        // HAND_SELECT — pick the strongest monster, or an equip for our best field card
        turnCount++;
        console.log(`\n--- Turn ${turnCount} ---`);
        console.log(describeState());

        const hand = activeCards(state.hand);
        // Find strongest monster in hand
        const monsters = hand.filter((c) => c.atk > 0).sort((a, b) => b.atk - a.atk);

        if (monsters.length > 0) {
          const pick = monsters[0];
          const handIndex = hand.indexOf(pick);
          console.log(
            `  Strategy: play ${cardName(pick.cardId)} (${pick.atk}/${pick.def}) from slot ${handIndex}`,
          );

          // Navigate to the card (cursor starts at slot 0, use right to move)
          for (let i = 0; i < handIndex; i++) {
            await tap("right");
            await new Promise((r) => setTimeout(r, 200));
          }
          // Select the card
          changed = await act("cross", true);
        } else {
          // All equips — just play first card
          console.log("  Strategy: play first card (equip/spell)");
          changed = await act("cross", true);
        }
        break;
      }

      case 5: // FIELD — placement. Just press cross to place.
        changed = await act("cross", true);
        break;

      case 7: // FUSION
      case 8: // FUSION_RESOLVE
        changed = await act("cross", true);
        break;

      case 9: // BATTLE — attack! Press cross.
        changed = await act("cross", true);
        break;

      case 10: // POST_BATTLE
        changed = await act("cross", true);
        break;

      default:
        changed = await act("cross", false);
        break;
    }

    if (!changed) {
      stuckCount++;
      if (stuckCount > MaxStuck) {
        console.log("  [stuck! taking screenshot and trying circle]");
        screenshot();
        await act("circle", false);
        stuckCount = 0;
      }
    } else {
      stuckCount = 0;
    }
  }

  console.log("\n=== DONE ===");
  ws.close();
  process.exit();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
