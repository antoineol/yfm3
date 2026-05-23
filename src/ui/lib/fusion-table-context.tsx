import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  buildReferenceTableData,
  type ReferenceTableData,
} from "../../engine/reference/build-reference-table.ts";
import { useBridgeAutoSync } from "../db/use-user-preferences.ts";
import { useBridge } from "./bridge-context.tsx";
import { CardDbProvider } from "./card-db-context.tsx";
import { bridgeGameDataToReference, loadReferenceCsvs } from "./load-reference-csvs.ts";
import { useSelectedModSettled } from "./use-selected-mod.ts";

export type FusionTableData = ReferenceTableData;

const FusionTableContext = createContext<FusionTableData | null>(null);

export function FusionTableProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FusionTableData | null>(null);
  const autoSync = useBridgeAutoSync();
  const selectedMod = useSelectedModSettled();
  const bridge = useBridge();

  useEffect(() => {
    // Auto-sync mode must never load static CSV reference data. The active
    // game's labels, colors, fusions, and equips all come from bridge gameData.
    if (autoSync) {
      if (bridge.gameData) {
        setData(buildReferenceTableData(bridgeGameDataToReference(bridge.gameData)));
        return;
      }
      setData(null);
      return;
    }
    // Manual mode: load from CSV once the Convex mod preference has settled.
    if (selectedMod === undefined) return;
    setData(null);
    let cancelled = false;
    void loadReferenceCsvs(selectedMod).then((rows) => {
      if (!cancelled) setData(buildReferenceTableData(rows));
    });
    return () => {
      cancelled = true;
    };
  }, [autoSync, selectedMod, bridge.gameData]);

  return (
    <FusionTableContext.Provider value={data}>
      {data ? <CardDbProvider cardDb={data.cardDb}>{children}</CardDbProvider> : children}
    </FusionTableContext.Provider>
  );
}

export function useHasReferenceData(): boolean {
  return useContext(FusionTableContext) !== null;
}

export function useFusionTable(): FusionTableData {
  const context = useContext(FusionTableContext);
  if (!context) {
    throw new Error("useFusionTable must be used within a FusionTableProvider");
  }
  return context;
}
