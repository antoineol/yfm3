/**
 * Best plays finder — queries bridge for game data and computes
 * available fusions/equips for a given hand + field.
 *
 * Usage:
 *   node bridge/debug/best-plays.cjs
 *   Reads hand and field from live bridge state, outputs best plays.
 */

const WS = require("ws");

const BRIDGE_URL = "ws://172.28.48.1:3333";

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WS(BRIDGE_URL);
    let gameData = null;
    let state = null;

    ws.on("message", (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === "gameData") gameData = m;
      if ("duelPhase" in m && m.type !== "gameData") state = m;
    });

    ws.on("open", () => {
      // Wait for both gameData and state
      const check = setInterval(() => {
        if (gameData && state) {
          clearInterval(check);
          resolve({ ws, gameData, state });
        }
      }, 100);
    });

    ws.on("error", reject);
    setTimeout(() => reject(new Error("timeout")), 10000);
  });
}

/**
 * Find all 2-card fusions possible from a list of card IDs.
 * fusionTable is [{material1, material2, result}, ...]
 */
function findFusions(cardIds, fusionTable) {
  const results = [];
  for (let i = 0; i < cardIds.length; i++) {
    for (let j = i + 1; j < cardIds.length; j++) {
      const a = Math.min(cardIds[i], cardIds[j]);
      const b = Math.max(cardIds[i], cardIds[j]);
      const fusion = fusionTable.find((f) => f.material1 === a && f.material2 === b);
      if (fusion) {
        results.push({
          material1: cardIds[i],
          material2: cardIds[j],
          materialIndices: [i, j],
          result: fusion.result,
        });
      }
    }
  }
  return results;
}

/**
 * Find equip-compatible pairs: which equip cards can boost which monsters.
 * equipTable is [{equipId, monsterIds[]}, ...]
 */
function findEquips(handIds, fieldMonsterIds, equipTable) {
  const results = [];
  for (let i = 0; i < handIds.length; i++) {
    const equipEntry = equipTable.find((e) => e.equipId === handIds[i]);
    if (!equipEntry) continue;
    // Check against field monsters
    for (const monsterId of fieldMonsterIds) {
      if (equipEntry.monsterIds.includes(monsterId)) {
        results.push({ equipId: handIds[i], equipIndex: i, monsterId });
      }
    }
    // Check against other hand monsters (for future field placement)
    for (let j = 0; j < handIds.length; j++) {
      if (i === j) continue;
      if (equipEntry.monsterIds.includes(handIds[j])) {
        results.push({
          equipId: handIds[i],
          equipIndex: i,
          monsterId: handIds[j],
          monsterIndex: j,
        });
      }
    }
  }
  return results;
}

async function main() {
  const { ws, gameData, state } = await connect();

  const cards = gameData.cards || [];
  const fusionTable = gameData.fusionTable || [];
  const equipTable = gameData.equipTable || [];
  const name = (id) => (cards.find((c) => c.id === id) || {}).name || `#${id}`;
  const atk = (id) => (cards.find((c) => c.id === id) || {}).atk || 0;

  // Read hand (active cards only via bridge state)
  const hand = (state.hand || []).filter((c) => c.status & 0x80);
  const field = (state.field || []).filter((c) => c.status & 0x80);
  const oppField = (state.opponentField || []).filter((c) => c.status & 0x80);
  const handIds = hand.map((c) => c.cardId);
  const fieldIds = field.map((c) => c.cardId);

  console.log("=== CURRENT STATE ===");
  console.log("Hand:", handIds.map((id, i) => `[${i}]${name(id)}(${atk(id)})`).join("  "));
  console.log(
    "Field:",
    fieldIds.map((id) => `${name(id)}(${field.find((c) => c.cardId === id)?.atk})`).join(", ") ||
      "empty",
  );
  console.log("Opp:", oppField.map((c) => `${name(c.cardId)}(${c.atk})`).join(", ") || "empty");
  console.log();

  // Find fusions from hand cards
  const allCards = [...handIds, ...fieldIds];
  const fusions = findFusions(allCards, fusionTable);

  if (fusions.length > 0) {
    console.log("=== POSSIBLE FUSIONS ===");
    fusions
      .sort((a, b) => atk(b.result) - atk(a.result))
      .forEach((f) => {
        console.log(
          `  ${name(f.material1)}(${atk(f.material1)}) + ${name(f.material2)}(${atk(f.material2)}) → ${name(f.result)}(${atk(f.result)})`,
        );
      });
  } else {
    console.log("No fusions available.");
  }

  // Find equips
  const equips = findEquips(handIds, fieldIds, equipTable);

  if (equips.length > 0) {
    console.log("\n=== POSSIBLE EQUIPS ===");
    equips.forEach((e) => {
      const target = e.monsterIndex !== undefined ? "hand" : "field";
      console.log(`  ${name(e.equipId)} → ${name(e.monsterId)} (${target})`);
    });
  } else {
    console.log("No equips available.");
  }

  // Best play recommendation
  console.log("\n=== BEST PLAY ===");
  if (fusions.length > 0) {
    const best = fusions.sort((a, b) => atk(b.result) - atk(a.result))[0];
    console.log(
      `Fuse: ${name(best.material1)} + ${name(best.material2)} → ${name(best.result)}(${atk(best.result)})`,
    );
    const oppMax = Math.max(0, ...oppField.map((c) => c.atk));
    if (atk(best.result) > oppMax) {
      console.log(`  → Beats opponent's strongest (${oppMax})`);
    } else {
      console.log(`  → Still weaker than opponent's ${oppMax}`);
    }
  } else {
    const bestMonster = hand.filter((c) => c.atk > 0).sort((a, b) => b.atk - a.atk)[0];
    if (bestMonster) {
      console.log(`Play: ${name(bestMonster.cardId)}(${bestMonster.atk}) — no fusions available`);
    } else {
      console.log("No monsters in hand.");
    }
  }

  ws.close();
  process.exit();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
