import { CardTable } from "../../components/CardTable.tsx";
import { PanelBody } from "../../components/panel-chrome.tsx";
import { useLiveDeckEntries } from "./use-live-deck-entries.ts";

export function OptimizationProgress() {
  const liveDeckEntries = useLiveDeckEntries();

  return (
    <PanelBody>{liveDeckEntries.length > 0 && <CardTable entries={liveDeckEntries} />}</PanelBody>
  );
}
