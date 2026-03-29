import { bridgeGameDataToReference, loadReferenceCsvs } from "../../ui/lib/load-reference-csvs.ts";
import type { FarmDiscoveryResult } from "../farm/discover-farmable-fusions.ts";
import { discoverFarmableFusions } from "../farm/discover-farmable-fusions.ts";
import {
  buildReferenceTableData,
  type ReferenceTableData,
} from "../reference/build-reference-table.ts";
import type {
  FarmWorkerInit,
  FarmWorkerResult,
  SerializedFarmDiscoveryResult,
} from "./messages.ts";

async function loadReferenceData(msg: FarmWorkerInit): Promise<ReferenceTableData> {
  if (msg.gameData) {
    return buildReferenceTableData(bridgeGameDataToReference(msg.gameData));
  }
  return buildReferenceTableData(await loadReferenceCsvs(msg.modId));
}

function serializeResult(result: FarmDiscoveryResult): SerializedFarmDiscoveryResult {
  return {
    fusions: result.fusions.map((f) => ({
      resultCardId: f.resultCardId,
      resultAtk: f.resultAtk,
      resultName: f.resultName,
      depth: f.depth,
      materials: f.materials,
      missingMaterials: f.missingMaterials,
      dropSources: Object.fromEntries([...f.dropSources.entries()].map(([k, v]) => [String(k), v])),
    })),
    duelistRanking: result.duelistRanking,
  };
}

self.onmessage = async (e: MessageEvent<FarmWorkerInit>) => {
  const msg = e.data;
  const ref = await loadReferenceData(msg);

  const collection = new Map<number, number>(
    Object.entries(msg.collection).map(([id, qty]) => [Number(id), qty as number]),
  );

  const unlockedSet = msg.unlockedDuelists ? new Set(msg.unlockedDuelists) : undefined;

  const pow = discoverFarmableFusions(
    collection,
    ref.fusionTable,
    ref.cardAtk,
    ref.cardDb,
    msg.fusionDepth,
    msg.deckScore,
    ref.duelists,
    ref.fusions,
    "pow",
    unlockedSet,
  );

  const tec = discoverFarmableFusions(
    collection,
    ref.fusionTable,
    ref.cardAtk,
    ref.cardDb,
    msg.fusionDepth,
    msg.deckScore,
    ref.duelists,
    ref.fusions,
    "tec",
    unlockedSet,
  );

  const result: FarmWorkerResult = {
    type: "FARM_RESULT",
    pow: serializeResult(pow),
    tec: serializeResult(tec),
  };
  self.postMessage(result);
};
