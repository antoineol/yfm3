import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { CardFormDialog } from "./CardFormDialog.tsx";
import { CardsTable } from "./CardsTable.tsx";
import { FusionFormDialog } from "./FusionFormDialog.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

type View = "cards" | "fusions";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
];

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL as string | undefined;

export function DataPanel() {
  const data = useQuery(api.referenceData.getReferenceData);
  const sync = useAction(api.syncReferenceData.syncFromSheets);
  const [view, setView] = useState<View>("cards");
  const [showCreate, setShowCreate] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!window.confirm("Pull all data from Google Sheets? This will overwrite local changes."))
      return;
    setSyncing(true);
    try {
      const result = await sync({});
      if (result.skipped) {
        toast.info("Already up to date");
      } else {
        toast.success("Reference data synced");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!data) {
    return <div className="text-center py-8 text-text-muted">Loading reference data...</div>;
  }

  return (
    <div className="flex flex-col gap-3 h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-center">
        <ToggleGroup onChange={setView} options={VIEW_OPTIONS} value={view} />
      </div>
      <div className="flex items-center gap-3">
        {SHEETS_URL && (
          <a
            className="text-xs text-gold-dim hover:text-gold transition-colors"
            href={SHEETS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in Sheets
          </a>
        )}
        <IconButton
          className="size-7"
          disabled={syncing}
          label={syncing ? "Syncing…" : "Sync from Sheets"}
          onClick={() => void handleSync()}
        >
          <SyncIcon spinning={syncing} />
        </IconButton>
        <span className="ml-auto text-xs text-text-muted">
          {view === "cards" ? `${data.cards.length} cards` : `${data.fusions.length} fusions`}
        </span>
        <Button onClick={() => setShowCreate(true)} size="sm" variant="outline">
          + Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "cards" ? (
          <CardsTable cards={data.cards} />
        ) : (
          <FusionsTable fusions={data.fusions} />
        )}
      </div>

      {view === "cards" ? (
        <CardFormDialog mode="create" onClose={() => setShowCreate(false)} open={showCreate} />
      ) : (
        <FusionFormDialog mode="create" onClose={() => setShowCreate(false)} open={showCreate} />
      )}
    </div>
  );
}

function SyncIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-3.5 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
