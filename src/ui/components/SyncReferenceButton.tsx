import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "./Button.tsx";

type SyncState = "idle" | "syncing" | "done" | "error";

export function SyncReferenceButton() {
  const sync = useAction(api.syncReferenceData.syncFromSheets);
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setState("syncing");
    setMessage("");
    try {
      const result = await sync({});
      setMessage(`Synced at ${new Date(result.importedAt).toLocaleTimeString()}`);
      setState("done");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sync failed");
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button disabled={state === "syncing"} onClick={handleSync} size="sm" variant="outline">
        {state === "syncing" ? "Syncing…" : "Sync from Google Sheets"}
      </Button>
      {message && (
        <p className={`text-xs ${state === "error" ? "text-red-400" : "text-text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
