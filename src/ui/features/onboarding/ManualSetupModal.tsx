import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { isKnownModId, type KnownModId, MODS } from "../../../engine/mods.ts";
import { Button } from "../../components/Button.tsx";
import { Dialog } from "../../components/Dialog.tsx";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { manualSetupModalOpenAtom } from "../../lib/atoms.ts";
import { useSelectedMod, useSetSelectedMod } from "../../lib/use-selected-mod.ts";
import { DownloadLink } from "../bridge/setup-steps.tsx";
import { importExportSchema } from "../config/import-export-schema.ts";

export function ManualSetupModal() {
  const [open, setOpen] = useAtom(manualSetupModalOpenAtom);
  const selectedMod = useSelectedMod();
  const setSelectedMod = useSetSelectedMod();
  const importMutation = useAuthMutation(api.importExport.importData);
  const [loadingSample, setLoadingSample] = useState(false);

  const handleSelectMod = useCallback(
    (mod: KnownModId) => void setSelectedMod({ selectedMod: mod }),
    [setSelectedMod],
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleLoadSample = useCallback(async () => {
    setLoadingSample(true);
    try {
      const res = await fetch("/data/sample.json");
      const parsed = importExportSchema.safeParse(await res.json());
      if (!parsed.success) {
        toast.error("Invalid sample data");
        return;
      }
      await importMutation({
        collection: parsed.data.collection,
        deck: parsed.data.deck,
      });
      toast.success("Sample collection loaded");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sample data");
    } finally {
      setLoadingSample(false);
    }
  }, [importMutation, setOpen]);

  const mod = isKnownModId(selectedMod) ? MODS[selectedMod] : MODS.vanilla;

  return (
    <Dialog onClose={handleClose} open={open} title="Setup guide">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">
            Game version
          </p>
          <VersionSelector onSelectMod={handleSelectMod} selectedMod={selectedMod} />
          <DownloadLink href={mod.gameDownloadUrl}>{mod.gameDownloadLabel}</DownloadLink>
        </div>

        <div className="border-t border-border-subtle" />

        <div className="space-y-3 text-center">
          <p className="text-xs text-text-muted">Or try it out with example data</p>
          <Button
            disabled={loadingSample}
            onClick={() => void handleLoadSample()}
            variant="outline"
          >
            {loadingSample ? "Loading..." : "Load sample collection"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ── Version selector ──────────────────────────────────────────────

function VersionSelector({
  selectedMod,
  onSelectMod,
}: {
  selectedMod: string;
  onSelectMod: (mod: KnownModId) => void;
}) {
  const mods = Object.values(MODS);

  return (
    <div className="flex rounded-lg bg-bg-surface border border-border-subtle p-0.5 w-full">
      {mods.map((mod) => (
        <button
          className={`flex-1 py-2.5 text-xs font-display font-bold uppercase tracking-widest rounded-md transition-colors cursor-pointer ${
            selectedMod === mod.id
              ? "bg-bg-hover text-gold-bright"
              : "text-text-secondary hover:text-text-primary"
          }`}
          key={mod.id}
          onClick={() => onSelectMod(mod.id)}
          type="button"
        >
          {mod.name}
        </button>
      ))}
    </div>
  );
}
