import { execSync } from "node:child_process";

/**
 * Fixture check for the PAL French recap screenshots captured while the duel
 * result screen is open. It verifies both the bridge's scored counters and the
 * raw result-memory bytes used to map them.
 */

type BridgeState = {
  connected?: boolean;
  status?: string;
  gameSerial?: string | null;
  duelPhase?: number | null;
  turnIndicator?: number | null;
  rankCounters?: Array<number | null> | null;
};

const DEFAULT_URL = "ws://localhost:3333";
const TIMEOUT_MS = 10_000;
const PAL_RECAP_BASE = 0x0eb279;
const PAL_RECAP_LENGTH = 0x20;

const EXPECTED_RECAP = {
  victoryCondition: "STAT. DE DEFENSE",
  finalRank: "S-POW",
  score: 93,
  turns: 3,
  playerCardsUsed: 8,
  opponentCardsUsed: 7,
  playerRemainingLp: 8000,
  opponentRemainingLp: 0,
  playerAttackFactorAvg: 627,
  opponentAttackFactorAvg: 226,
  playerCardDestruction: 3,
  opponentCardDestruction: 0,
  playerEffectiveAttacks: 0,
  opponentEffectiveAttacks: 0,
  playerDefenseFactorAvg: 523,
  opponentDefenseFactorAvg: 222,
  playerDefensiveLosses: 0,
  opponentDefensiveLosses: 3,
  playerDefensiveWins: 0,
  opponentDefensiveWins: 0,
  playerComboPlays: 2,
  opponentComboPlays: 0,
  playerFaceDownPlays: 0,
  opponentFaceDownPlays: 3,
  playerInitiatedFusions: 1,
  opponentInitiatedFusions: 0,
  playerEquipMagicUsed: 1,
  opponentEquipMagicUsed: 0,
  playerTerrainChanges: 0,
  opponentTerrainChanges: 0,
  playerPureMagic: 0,
  opponentPureMagic: 0,
  playerTrapAbsorbed: 0,
  opponentTrapAbsorbed: 0,
} as const;

const EXPECTED_RANK_COUNTERS = [
  ["Turns", EXPECTED_RECAP.turns],
  ["Eff. attacks", EXPECTED_RECAP.playerEffectiveAttacks],
  ["Def. wins", EXPECTED_RECAP.playerDefensiveWins],
  ["Face-downs", EXPECTED_RECAP.playerFaceDownPlays],
  ["Fusions", EXPECTED_RECAP.playerInitiatedFusions],
  ["Equips", EXPECTED_RECAP.playerEquipMagicUsed],
  ["Magic", EXPECTED_RECAP.playerPureMagic],
  ["Traps", EXPECTED_RECAP.playerTrapAbsorbed],
  ["Cards left", 40 - EXPECTED_RECAP.playerCardsUsed],
  ["Remaining LP", EXPECTED_RECAP.playerRemainingLp],
] as const;

const EXPECTED_PAL_MEMORY = [
  ["Turns", 0x0eb279, 1, EXPECTED_RECAP.turns],
  ["Eff. attacks", 0x0eb27a, 1, EXPECTED_RECAP.playerEffectiveAttacks],
  ["Def. wins", 0x0eb27b, 1, EXPECTED_RECAP.playerDefensiveWins],
  ["Face-downs", 0x0eb27c, 1, EXPECTED_RECAP.playerFaceDownPlays],
  ["Magic", 0x0eb27d, 1, EXPECTED_RECAP.playerPureMagic],
  ["Traps", 0x0eb27e, 1, EXPECTED_RECAP.playerTrapAbsorbed],
  ["Recap combo plays", 0x0eb27f, 1, EXPECTED_RECAP.playerComboPlays],
  ["Initiated fusions", 0x0eb280, 1, EXPECTED_RECAP.playerInitiatedFusions],
  ["Equips", 0x0eb281, 1, EXPECTED_RECAP.playerEquipMagicUsed],
  ["Player card destruction", 0x0eb283, 1, EXPECTED_RECAP.playerCardDestruction],
  ["Player attack avg", 0x0eb286, 2, EXPECTED_RECAP.playerAttackFactorAvg],
  ["Player defense avg", 0x0eb288, 2, EXPECTED_RECAP.playerDefenseFactorAvg],
  ["Remaining LP", 0x0eb28a, 2, EXPECTED_RECAP.playerRemainingLp],
  ["Cards used", 0x0eb296, 1, EXPECTED_RECAP.playerCardsUsed],
] as const;

async function main(): Promise<void> {
  const requestedUrl = process.argv[2] ?? DEFAULT_URL;
  console.log("Expected recap:");
  console.log(JSON.stringify(EXPECTED_RECAP, null, 2));
  console.log("Expected bridge rankCounters:");
  console.table(EXPECTED_RANK_COUNTERS.map(([name, expected]) => ({ name, expected })));
  console.log("Expected PAL result-memory addresses:");
  console.table(
    EXPECTED_PAL_MEMORY.map(([name, address, bytes, expected]) => ({
      name,
      address: hexAddress(address),
      bytes,
      expected,
    })),
  );

  const { url, state, rawBlock } = await readLiveBridge(requestedUrl);
  console.log("Live bridge state:");
  console.log(
    JSON.stringify(
      {
        url,
        gameSerial: state.gameSerial ?? null,
        duelPhase: state.duelPhase ?? null,
        turnIndicator: state.turnIndicator ?? null,
        rankCounters: state.rankCounters ?? null,
        rawPalRecapBlock: rawBlock.hex,
      },
      null,
      2,
    ),
  );

  const memoryMismatches = comparePalMemory(parseHex(rawBlock.hex));
  if (memoryMismatches.length > 0) {
    console.error("PAL result-memory mismatches:");
    console.table(memoryMismatches);
  } else {
    console.log("Raw PAL result-memory bytes match the screenshots.");
  }

  const actual = state.rankCounters;
  if (!actual) {
    throw new Error("Bridge state has no rankCounters.");
  }

  const mismatches = EXPECTED_RANK_COUNTERS.flatMap(([name, expected], index) => {
    const value = actual[index];
    return value === expected ? [] : [{ name, expected, actual: value }];
  });

  if (mismatches.length > 0) {
    console.error("Rank counter mismatches:");
    console.table(mismatches);
    process.exitCode = 1;
    return;
  }

  if (memoryMismatches.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Live bridge rank counters match the screenshots.");
}

async function readLiveBridge(
  requestedUrl: string,
): Promise<{ url: string; state: BridgeState; rawBlock: ReadMemResult }> {
  const urls = requestedUrl === DEFAULT_URL ? [DEFAULT_URL, ...windowsHostUrls()] : [requestedUrl];
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const result = await readLiveBridgeAtUrl(url);
      return { url, ...result };
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Could not read bridge.\n${errors.join("\n")}`);
}

function readLiveBridgeAtUrl(
  url: string,
): Promise<{ state: BridgeState; rawBlock: ReadMemResult }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let state: BridgeState | null = null;
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error(`Timed out after ${TIMEOUT_MS}ms waiting for ready bridge state at ${url}`));
    }, TIMEOUT_MS);

    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Could not connect to bridge at ${url}`));
    };

    ws.onmessage = (event) => {
      const parsed = parseMessage(event.data);
      if (isReadyBridgeState(parsed)) {
        state = parsed;
        ws.send(
          JSON.stringify({ type: "readMem", offset: PAL_RECAP_BASE, length: PAL_RECAP_LENGTH }),
        );
        return;
      }
      if (isReadMemResult(parsed)) {
        clearTimeout(timer);
        ws.close();
        if (!state) {
          reject(new Error("Received readMem_result before ready bridge state."));
          return;
        }
        if (parsed.error) {
          reject(new Error(`readMem failed: ${parsed.error}`));
          return;
        }
        resolve({ state, rawBlock: parsed });
      }
    };
  });
}

type ReadMemResult = {
  type: "readMem_result";
  offset?: number;
  length?: number;
  hex: string;
  error?: string;
};

function isReadMemResult(value: BridgeState | ReadMemResult | null): value is ReadMemResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "readMem_result"
  );
}

function isReadyBridgeState(value: BridgeState | ReadMemResult | null): value is BridgeState {
  return (
    typeof value === "object" &&
    value !== null &&
    "connected" in value &&
    value.connected === true &&
    "status" in value &&
    value.status === "ready"
  );
}

function parseMessage(data: unknown): (BridgeState | ReadMemResult) | null {
  if (typeof data !== "string") return null;
  try {
    return JSON.parse(data) as BridgeState | ReadMemResult;
  } catch {
    return null;
  }
}

function comparePalMemory(bytes: number[]) {
  return EXPECTED_PAL_MEMORY.flatMap(([name, address, size, expected]) => {
    const index = address - PAL_RECAP_BASE;
    const actual =
      size === 2 ? (bytes[index] ?? Number.NaN) + ((bytes[index + 1] ?? 0) << 8) : bytes[index];
    return actual === expected
      ? []
      : [{ name, address: hexAddress(address), expected, actual: actual ?? null }];
  });
}

function parseHex(hex: string): number[] {
  return hex
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((byte) => Number.parseInt(byte, 16));
}

function hexAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(6, "0")}`;
}

function windowsHostUrls(): string[] {
  try {
    const gateway = execSync("ip route | awk '/default/ {print $3; exit}'", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return gateway ? [`ws://${gateway}:3333`] : [];
  } catch {
    return [];
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
