import { useAtomValue } from "jotai";
import { loadedSaveAtom } from "./atoms.ts";
import { Ledger } from "./Ledger.tsx";
import { SummaryBar } from "./SummaryBar.tsx";

export function SaveEditor() {
  const loaded = useAtomValue(loadedSaveAtom);
  if (!loaded) return null;
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <SummaryBar />
      <div className="flex-1 min-h-0 flex flex-col">
        <Ledger />
      </div>
    </div>
  );
}
