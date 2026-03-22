import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  buildReferenceTableData,
  type ReferenceTableData,
} from "../../engine/reference/build-reference-table.ts";
import { CardDbProvider } from "./card-db-context.tsx";
import { loadReferenceCsvs } from "./load-reference-csvs.ts";
import { useSelectedMod } from "./use-selected-mod.ts";

export type FusionTableData = ReferenceTableData;

const FusionTableContext = createContext<FusionTableData | null>(null);

export function FusionTableProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FusionTableData | null>(null);
  const selectedMod = useSelectedMod();

  useEffect(() => {
    setData(null);
    void loadReferenceCsvs(selectedMod).then((rows) => setData(buildReferenceTableData(rows)));
  }, [selectedMod]);

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
