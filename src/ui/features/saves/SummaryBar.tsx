import { Menu } from "@base-ui/react/menu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { STARCHIPS_MAX } from "../../../engine/savefile/save.ts";
import { Button } from "../../components/Button.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { Input } from "../../components/Input.tsx";
import { useBridge } from "../../lib/bridge-context.tsx";
import {
  grantAllCardsAtom,
  isModifiedAtom,
  type LoadedSave,
  loadActiveSaveAtom,
  loadedSaveAtom,
  mergeOwnedCounts,
  quantitiesAtom,
  revertEditsAtom,
  saveToDiskAtom,
  savingAtom,
  setStarchipsAtom,
  starchipsAtom,
} from "./atoms.ts";
import { BackupsDrawerButton } from "./BackupPanel.tsx";

const UNIQUE_CARDS_CAP = 720;

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation (no save state) so the new memcard contents can be written. " +
  "After it saves, click the game row in DuckStation and choose 'Démarrage normal' to reload with the edits.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

export function SummaryBar() {
  const loaded = useAtomValue(loadedSaveAtom);
  if (!loaded) return null;
  return <SummaryBarInner loaded={loaded} />;
}

function SummaryBarInner({ loaded }: { loaded: LoadedSave }) {
  const bridge = useBridge();
  const starchips = useAtomValue(starchipsAtom);
  const quantities = useAtomValue(quantitiesAtom);
  const isModified = useAtomValue(isModifiedAtom);
  const saving = useAtomValue(savingAtom);
  const setStarchipsAction = useSetAtom(setStarchipsAtom);
  const grantAll = useSetAtom(grantAllCardsAtom);
  const revert = useSetAtom(revertEditsAtom);
  const saveToDisk = useSetAtom(saveToDiskAtom);
  const loadActive = useSetAtom(loadActiveSaveAtom);
  const [actionsRef] = useAutoAnimate();

  const owned = mergeOwnedCounts(quantities, bridge.deckDefinition);
  const uniqueCount = Object.keys(owned).length;
  const totalCopies = Object.values(owned).reduce((s, n) => s + n, 0);

  async function onSave() {
    if (bridge.detail === "ready" && !window.confirm(CONFIRM_MESSAGE)) return;
    try {
      const outcome = await saveToDisk();
      if (!outcome) return;
      const backupPart = outcome.backup ? ` · backup: ${outcome.backup.filename}` : "";
      if (outcome.closedGame) {
        toast.success(
          `Saved ${loaded.entry.memcardFilename}${backupPart}. Click the game in DuckStation and choose 'Démarrage normal' to reload with the edits.`,
          { duration: 10000 },
        );
      } else {
        toast.success(`Saved ${loaded.entry.memcardFilename}${backupPart}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    }
  }

  return (
    <div className="flex items-center gap-x-3 gap-y-1 px-3 py-1.5 border-b border-border-subtle flex-wrap">
      <Starchips onCommit={setStarchipsAction} value={starchips} />
      <Stat label="Unique" value={`${uniqueCount.toLocaleString("en-US")} / ${UNIQUE_CARDS_CAP}`} />
      <Stat label="Copies" value={totalCopies.toLocaleString("en-US")} />
      <div className="ml-auto flex items-center gap-2" ref={actionsRef}>
        <BackupsDrawerButton />
        {isModified && (
          <>
            <Button disabled={saving} onClick={() => revert()} size="sm" variant="ghost">
              Revert
            </Button>
            <Button disabled={saving} glowing onClick={onSave} size="sm">
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        )}
        <OverflowMenu onGrantAll={grantAll} onReload={() => loadActive()} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-display text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

function Starchips({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);

  function commit() {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= STARCHIPS_MAX) {
      onCommit(parsed);
    }
    setDraft(null);
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <label
        className="font-display text-[10px] uppercase tracking-widest text-text-muted"
        htmlFor="saves-starchips"
      >
        Starchips
      </label>
      <Input
        className="py-0.5! px-1.5! text-sm! font-mono! tabular-nums! text-right! w-20!"
        id="saves-starchips"
        inputMode="numeric"
        onBlur={commit}
        onChange={(e) => setDraft(e.currentTarget.value.replace(/[^\d]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        value={display}
      />
    </div>
  );
}

const menuItemClass =
  "w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary data-highlighted:text-text-primary data-highlighted:bg-bg-hover transition-colors cursor-pointer";

function OverflowMenu({
  onGrantAll,
  onReload,
}: {
  onGrantAll: (n: number) => void;
  onReload: () => void;
}) {
  function confirmGrant(n: number) {
    if (
      !window.confirm(
        `Set every card's copy count to ${n}?\n\nThis overwrites your current collection — click Save to write it to disk.`,
      )
    ) {
      return;
    }
    onGrantAll(n);
    toast.success(`Granted ${n}× every card`);
  }
  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton label="More actions" />}>
        <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" className="z-50" sideOffset={4}>
          <Menu.Popup className="bg-bg-panel border border-border-accent rounded-lg shadow-dropdown py-1 min-w-40">
            <Menu.Item className={menuItemClass} onClick={onReload}>
              Reload from disk
            </Menu.Item>
            <div className="h-px bg-border-subtle my-1" />
            <div className="px-3 pt-1 pb-0.5 font-display text-[10px] uppercase tracking-widest text-text-muted">
              Grant every card
            </div>
            {[1, 3, 99].map((n) => (
              <Menu.Item className={menuItemClass} key={n} onClick={() => confirmGrant(n)}>
                × {n}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
