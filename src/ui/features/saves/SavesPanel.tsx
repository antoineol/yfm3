import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Button } from "../../components/Button.tsx";
import { PanelCard, PanelEmptyState } from "../../components/panel-chrome.tsx";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { loadActiveSaveAtom, loadedSaveAtom, loadStateAtom } from "./atoms.ts";
import { SaveEditor } from "./SaveEditor.tsx";

export function SavesPanel() {
  const autoSyncOn = useBridgeAutoSync();
  const bridge = useBridge();
  const loadState = useAtomValue(loadStateAtom);
  const loadActive = useSetAtom(loadActiveSaveAtom);

  // `bridge.detail === "ready"` is the bridge's "DuckStation has a game loaded
  // in RAM" signal. We deliberately do NOT gate on `bridge.gameData` — that
  // arrives via a separate async pipeline (disc extraction with retries) and
  // can lag for seconds or fail forever, leaving this panel stuck on "Waiting"
  // even though the memcard is reachable. The save editor only needs the
  // bridge HTTP API, which is up whenever the bridge process is up.
  const gameReady = autoSyncOn && bridge.detail === "ready";
  // Reload on game change too — `gameSerial` flips when DuckStation swaps
  // discs or restarts into a different game.
  const gameSerial = bridge.gameSerial;
  useEffect(() => {
    if (gameReady && gameSerial) void loadActive();
  }, [gameReady, gameSerial, loadActive]);

  return (
    <PanelCard className="w-full max-w-5xl mx-auto">
      <Body autoSyncOn={autoSyncOn} gameReady={gameReady} loadState={loadState} />
    </PanelCard>
  );
}

function Body({
  autoSyncOn,
  gameReady,
  loadState,
}: {
  autoSyncOn: boolean;
  gameReady: boolean;
  loadState: { status: string };
}) {
  if (!autoSyncOn) {
    return (
      <PanelEmptyState
        subtitle="Turn on auto-sync (top bar) so the bridge can read the active game and find its memcard."
        title="Auto-sync mode required"
      />
    );
  }
  if (!gameReady) {
    return (
      <PanelEmptyState
        subtitle="Launch a game in DuckStation to edit its save. Once the bridge detects the game, this panel will populate automatically."
        title="Waiting for a running game"
      />
    );
  }
  if (loadState.status === "loading" || loadState.status === "idle") {
    return <LoadingOrEditor />;
  }
  if (loadState.status === "error") {
    return <ErrorState />;
  }
  return <LoadingOrEditor />;
}

function LoadingOrEditor() {
  const loaded = useAtomValue(loadedSaveAtom);
  const loadState = useAtomValue(loadStateAtom);
  if (loaded) return <SaveEditor />;
  if (loadState.status === "loading") {
    return <div className="py-10 text-center text-text-muted text-sm">Reading save…</div>;
  }
  return null;
}

function ErrorState() {
  const loadState = useAtomValue(loadStateAtom);
  const loadActive = useSetAtom(loadActiveSaveAtom);
  if (loadState.status !== "error") return null;
  const { error } = loadState;

  if (error.kind === "no_save_for_active_game") {
    return <NoSaveDiagnostics error={error} onRetry={() => loadActive()} />;
  }
  if (error.kind === "no_active_game") {
    return (
      <PanelEmptyState
        subtitle="The bridge lost track of the running game. Make sure DuckStation is focused and a game is loaded."
        title="No active game"
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 py-10 px-3 text-center">
      <p className="text-stat-atk text-sm">Couldn't reach the bridge.</p>
      <p className="text-text-muted text-xs max-w-prose">{error.message}</p>
      <Button onClick={() => loadActive()} size="sm" variant="outline">
        Retry
      </Button>
    </div>
  );
}

function NoSaveDiagnostics({
  error,
  onRetry,
}: {
  error: Extract<
    ReturnType<typeof useAtomValue<typeof loadStateAtom>>,
    { status: "error" }
  >["error"] & { kind: "no_save_for_active_game" };
  onRetry: () => void;
}) {
  const diag = error.diagnostics;
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="text-center flex flex-col gap-2">
        <h4 className="font-display text-lg uppercase tracking-wide text-gold-bright">
          No save file matched
        </h4>
        <p className="text-text-muted text-sm max-w-prose mx-auto">
          {error.reason ?? "The bridge could not resolve a memcard for the running game."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DiagField label="Resolved title" value={diag?.resolvedTitle ?? "(unavailable)"} />
        <DiagField label="Running serial" value={error.gameSerial ?? "(unavailable)"} />
        <DiagField label="Card1Type" value={diag?.card1Type ?? "?"} />
        <DiagField label="Expected filename" value={diag?.expectedFilename ?? "(none)"} />
      </div>

      {diag?.windowTitle && diag.windowTitle !== diag.resolvedTitle && (
        <div className="rounded-md border border-border-subtle bg-bg-surface p-3 flex flex-col gap-1">
          <div className="font-display text-[10px] uppercase tracking-widest text-text-muted">
            DuckStation window title
          </div>
          <code className="font-mono text-xs text-text-secondary break-all">
            {diag.windowTitle}
          </code>
        </div>
      )}

      <div className="rounded-md border border-border-subtle bg-bg-surface p-3 flex flex-col gap-1">
        <div className="font-display text-[10px] uppercase tracking-widest text-text-muted">
          Memcards directory
        </div>
        <code className="font-mono text-xs text-text-secondary break-all">
          {diag?.memcardsDir ?? "(could not resolve — DuckStation settings.ini not found)"}
        </code>
      </div>

      <div className="rounded-md border border-border-subtle bg-bg-surface">
        <div className="px-3 py-2 border-b border-border-subtle font-display text-[10px] uppercase tracking-widest text-text-muted">
          Memcards on disk ({diag?.availableMemcards.length ?? 0})
        </div>
        {diag?.availableMemcards.length ? (
          <ul className="divide-y divide-border-subtle/40 max-h-60 overflow-y-auto">
            {diag.availableMemcards.map((name) => {
              const matches = name === diag.expectedFilename;
              return (
                <li className="px-3 py-1.5 flex items-center gap-3 text-xs" key={name}>
                  <span
                    className={`font-mono shrink-0 ${matches ? "text-stat-up" : "text-text-muted"}`}
                  >
                    {matches ? "✓" : "·"}
                  </span>
                  <span className="font-mono text-text-secondary truncate">{name}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-3 py-4 text-center text-xs text-text-muted italic">
            No <code className="font-mono">.mcd</code> files in this directory.
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      </div>
    </div>
  );
}

function DiagField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-3 flex flex-col gap-1 min-w-0">
      <div className="font-display text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <code className="font-mono text-xs text-text-secondary break-all">{value}</code>
    </div>
  );
}
