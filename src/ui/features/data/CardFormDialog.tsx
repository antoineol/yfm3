import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { Dialog } from "../../components/Dialog.tsx";
import { Input } from "../../components/Input.tsx";
import { Select } from "../../components/Select.tsx";
import { type CardFormValues, cardFormSchema } from "./card-form-schema.ts";

const KIND_OPTIONS = [
  "",
  "Dragon",
  "Fairy",
  "Beast",
  "Fiend",
  "Warrior",
  "Zombie",
  "WingedBeast",
  "Machine",
  "Rock",
  "Plant",
  "Dinosaur",
  "Spellcaster",
  "Pyro",
  "Reptile",
  "Aqua",
  "Insect",
  "Thunder",
  "Fish",
  "Female",
  "MothInsect",
  "SharkFish",
  "SeaSerpent",
] as const;

const COLOR_OPTIONS = ["", "blue", "yellow", "orange", "red"] as const;

interface CardFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  defaultValues?: CardFormValues;
}

export function CardFormDialog({ open, onClose, mode, defaultValues }: CardFormDialogProps) {
  const create = useAction(api.referenceDataCrud.createCard);
  const update = useAction(api.referenceDataCrud.updateCard);
  const [saving, setSaving] = useState(false);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: defaultValues ?? { name: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? { name: "" });
    }
  }, [open, defaultValues, form]);

  const onSubmit = async (values: CardFormValues) => {
    setSaving(true);
    try {
      const { kind1, kind2, kind3, color, ...rest } = values;
      const args = {
        ...rest,
        kind1: kind1 || undefined,
        kind2: kind2 || undefined,
        kind3: kind3 || undefined,
        color: color || undefined,
      };
      if (mode === "create") {
        await create(args);
        toast.success("Card created");
      } else {
        await update({ ...args, originalName: defaultValues?.name ?? "" });
        toast.success("Card updated");
      }
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog onClose={onClose} open={open} title={mode === "create" ? "Add Card" : "Edit Card"}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldRow>
          <Field error={form.formState.errors.cardId?.message} label="ID">
            <Input
              {...form.register("cardId", { valueAsNumber: true })}
              disabled={mode === "edit"}
              error={!!form.formState.errors.cardId}
              type="number"
            />
          </Field>
          <Field error={form.formState.errors.name?.message} label="Name">
            <Input {...form.register("name")} error={!!form.formState.errors.name} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field error={form.formState.errors.attack?.message} label="ATK">
            <Input
              {...form.register("attack", { valueAsNumber: true })}
              error={!!form.formState.errors.attack}
              type="number"
            />
          </Field>
          <Field error={form.formState.errors.defense?.message} label="DEF">
            <Input
              {...form.register("defense", { valueAsNumber: true })}
              error={!!form.formState.errors.defense}
              type="number"
            />
          </Field>
        </FieldRow>
        <div className="grid grid-cols-3 gap-3">
          <Field error={form.formState.errors.kind1?.message} label="Kind 1">
            <Select {...form.register("kind1")} error={!!form.formState.errors.kind1}>
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k || "—"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kind 2">
            <Select {...form.register("kind2")}>
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k || "—"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kind 3">
            <Select {...form.register("kind3")}>
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k || "—"}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Color">
          <Select {...form.register("color")}>
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c || "—"}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2 justify-end pt-2">
          <Button disabled={saving} onClick={onClose} size="sm" variant="ghost">
            Cancel
          </Button>
          <Button disabled={saving} size="sm" type="submit">
            {saving ? "Saving\u2026" : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      {children}
      {error && <span className="text-xs text-stat-atk">{error}</span>}
    </div>
  );
}
