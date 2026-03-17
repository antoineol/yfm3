import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { IconButton } from "../../components/IconButton.tsx";
import { FusionFormDialog } from "./FusionFormDialog.tsx";
import type { FusionFormValues } from "./fusion-form-schema.ts";

interface ReferenceFusion {
  fusionId: number;
  materialA: string;
  materialB: string;
  resultName: string;
  resultAttack: number;
  resultDefense: number;
}

interface FusionsTableProps {
  fusions: ReferenceFusion[];
}

export function FusionsTable({ fusions }: FusionsTableProps) {
  const deleteFusion = useAction(api.referenceDataCrud.deleteFusion);
  const [editFusion, setEditFusion] = useState<FusionFormValues | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (f: ReferenceFusion) => {
    if (!window.confirm(`Delete fusion "${f.materialA} + ${f.materialB}"?`)) return;
    setDeleting(f.fusionId);
    try {
      await deleteFusion({ fusionId: f.fusionId, materialA: f.materialA, materialB: f.materialB });
      toast.success("Fusion deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="text-left py-2 px-1 font-normal">Material A</th>
              <th className="text-left py-2 px-1 font-normal">Material B</th>
              <th className="text-left py-2 px-1 font-normal">Result</th>
              <th className="text-left py-2 px-2 font-normal">ATK</th>
              <th className="text-left py-2 px-2 font-normal">DEF</th>
              <th className="py-2 px-1 font-normal" />
            </tr>
          </thead>
          <tbody>
            {fusions.map((f) => (
              <tr
                className="border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30"
                key={f.fusionId}
              >
                <td className="py-1.5 px-1 text-text-primary">{f.materialA}</td>
                <td className="py-1.5 px-1 text-text-primary">{f.materialB}</td>
                <td className="py-1.5 px-1 text-gold">{f.resultName}</td>
                <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">{f.resultAttack}</td>
                <td className="py-1.5 px-2 font-mono text-xs text-stat-def">{f.resultDefense}</td>
                <td className="py-0.5 px-1">
                  <div className="flex items-center gap-1 justify-end">
                    <IconButton
                      className="size-9"
                      label="Edit"
                      onClick={() => setEditFusion({ ...f })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      className="size-9"
                      disabled={deleting === f.fusionId}
                      label="Delete"
                      onClick={() => void handleDelete(f)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {fusions.length === 0 && (
              <tr>
                <td className="py-8 text-center text-text-muted" colSpan={6}>
                  No fusions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <FusionFormDialog
        defaultValues={editFusion ?? undefined}
        mode="edit"
        onClose={() => setEditFusion(null)}
        open={editFusion !== null}
      />
    </>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
