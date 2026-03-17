import { useQuery } from "convex/react";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { api } from "../../../convex/_generated/api";
import {
  buildReferenceTableData,
  type ReferenceTableData,
} from "../../engine/reference/build-reference-table.ts";
import { CardDbProvider } from "./card-db-context.tsx";

export type FusionTableData = ReferenceTableData;

const FusionTableContext = createContext<FusionTableData | null>(null);

export function FusionTableProvider({ children }: { children: ReactNode }) {
  const referenceData = useQuery(api.referenceData.getReferenceData);
  const importedAt = referenceData?.importedAt ?? null;

  // Cache the expensive buildReferenceTableData computation. Convex useQuery
  // returns a new object reference on every reactive tick even when the data
  // is unchanged, so we key on importedAt (a primitive) to avoid rebuilding
  // the 722x722 Int16Array fusion table on every tick.
  const cache = useRef<{ importedAt: number | null; data: FusionTableData | null }>({
    importedAt: null,
    data: null,
  });

  if (importedAt !== cache.current.importedAt) {
    cache.current.importedAt = importedAt;
    if (referenceData && referenceData.cards.length > 0 && referenceData.fusions.length > 0) {
      cache.current.data = buildReferenceTableData({
        cards: referenceData.cards,
        fusions: referenceData.fusions,
      });
    } else {
      cache.current.data = null;
    }
  }

  const data = cache.current.data;

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
