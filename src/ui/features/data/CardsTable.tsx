import { useAction } from "convex/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { CardEntry } from "../../components/CardTable.tsx";
import { CardTable } from "../../components/CardTable.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { CardFormDialog } from "./CardFormDialog.tsx";
import type { CardFormValues } from "./card-form-schema.ts";

interface ReferenceCard {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
}

interface CardsTableProps {
  cards: ReferenceCard[];
}

export function CardsTable({ cards }: CardsTableProps) {
  const deleteCard = useAction(api.referenceDataCrud.deleteCard);
  const [editCard, setEditCard] = useState<CardFormValues | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const entries = useMemo(
    (): CardEntry[] =>
      cards.map((c) => ({
        id: c.cardId,
        name: c.name,
        atk: c.attack,
        def: c.defense,
        qty: 1,
        kind1: c.kind1,
        kind2: c.kind2,
        kind3: c.kind3,
        color: c.color,
      })),
    [cards],
  );

  const handleDelete = async (entry: CardEntry) => {
    if (!window.confirm(`Delete "${entry.name}"?`)) return;
    setDeleting(entry.id);
    try {
      await deleteCard({ cardId: entry.id, name: entry.name });
      toast.success("Card deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  function renderActions(entry: CardEntry) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <IconButton
          className="size-9"
          label="Edit"
          onClick={() =>
            setEditCard({
              cardId: entry.id,
              name: entry.name,
              attack: entry.atk,
              defense: entry.def,
              kind1: entry.kind1 ?? "",
              kind2: entry.kind2 ?? "",
              kind3: entry.kind3 ?? "",
              color: entry.color ?? "",
            })
          }
        >
          <EditIcon />
        </IconButton>
        <IconButton
          className="size-9"
          disabled={deleting === entry.id}
          label="Delete"
          onClick={() => void handleDelete(entry)}
        >
          <TrashIcon />
        </IconButton>
      </div>
    );
  }

  return (
    <>
      <CardTable actions={renderActions} entries={entries} showKinds />
      <CardFormDialog
        defaultValues={editCard ?? undefined}
        mode="edit"
        onClose={() => setEditCard(null)}
        open={editCard !== null}
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
