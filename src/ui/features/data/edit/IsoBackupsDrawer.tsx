import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { Dialog } from "../../../components/Dialog.tsx";
import { backupsAtom, loadBackupsAtom, restoreBackupAtom } from "./atoms.ts";
import type { IsoBackupEntry } from "./bridge-client.ts";

export function IsoBackupsDrawerButton() {
  const backups = useAtomValue(backupsAtom);
  const loadBackups = useSetAtom(loadBackupsAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void loadBackups();
  }, [loadBackups]);

  const count = backups?.length ?? 0;
  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border-subtle text-[11px] font-display uppercase tracking-widest text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span>ISO backups</span>
        <span className="font-mono tabular-nums text-text-secondary">{count}</span>
      </button>
      <Dialog onClose={() => setOpen(false)} open={open} title="ISO backups">
        <BackupsList />
      </Dialog>
    </>
  );
}

function BackupsList() {
  const backups = useAtomValue(backupsAtom) ?? [];
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const restoreBackup = useSetAtom(restoreBackupAtom);

  async function onRestore(filename: string) {
    setPending(true);
    try {
      const preRestore = await restoreBackup(filename);
      const preRestorePart = preRestore ? ` (pre-restore backup: ${preRestore.filename})` : "";
      toast.success(`Restored ${filename}${preRestorePart}`);
      setConfirming(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Restore failed: ${msg}`);
    } finally {
      setPending(false);
    }
  }

  if (backups.length === 0) {
    return (
      <p className="text-xs text-text-muted italic py-4">
        No backups yet — the first pool save creates one automatically.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border-subtle/50 max-h-[60vh] overflow-y-auto">
      {backups.map((b) => (
        <BackupRow
          backup={b}
          confirming={confirming === b.filename}
          key={b.filename}
          onCancel={() => setConfirming(null)}
          onConfirm={() => onRestore(b.filename)}
          onRequestConfirm={() => setConfirming(b.filename)}
          pending={pending}
        />
      ))}
    </ul>
  );
}

function BackupRow({
  backup,
  confirming,
  pending,
  onRequestConfirm,
  onConfirm,
  onCancel,
}: {
  backup: IsoBackupEntry;
  confirming: boolean;
  pending: boolean;
  onRequestConfirm: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs text-text-secondary truncate">{backup.filename}</div>
        <div className="font-mono text-[10px] text-text-muted tabular-nums">
          {formatTimestamp(backup.timestamp)} · {formatBytes(backup.sizeBytes)}
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <Button disabled={pending} onClick={onConfirm} size="sm">
            Overwrite ISO
          </Button>
          <Button disabled={pending} onClick={onCancel} size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
      ) : (
        <Button disabled={pending} onClick={onRequestConfirm} size="sm" variant="outline">
          Restore
        </Button>
      )}
    </li>
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
