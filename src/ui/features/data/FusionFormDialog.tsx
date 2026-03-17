import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { Dialog } from "../../components/Dialog.tsx";
import { Input } from "../../components/Input.tsx";
import { type FusionFormValues, fusionFormSchema } from "./fusion-form-schema.ts";

interface FusionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  defaultValues?: FusionFormValues;
}

export function FusionFormDialog({ open, onClose, mode, defaultValues }: FusionFormDialogProps) {
  const create = useAction(api.referenceDataCrud.createFusion);
  const update = useAction(api.referenceDataCrud.updateFusion);
  const [saving, setSaving] = useState(false);

  const form = useForm<FusionFormValues>({
    resolver: zodResolver(fusionFormSchema),
    defaultValues: defaultValues ?? {
      materialA: "",
      materialB: "",
      resultName: "",
      resultAttack: 0,
      resultDefense: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        defaultValues ?? {
          materialA: "",
          materialB: "",
          resultName: "",
          resultAttack: 0,
          resultDefense: 0,
        },
      );
    }
  }, [open, defaultValues, form]);

  const onSubmit = async (values: FusionFormValues) => {
    setSaving(true);
    try {
      if (mode === "create") {
        await create(values);
        toast.success("Fusion created");
      } else {
        await update({
          ...values,
          originalMaterialA: defaultValues?.materialA ?? "",
          originalMaterialB: defaultValues?.materialB ?? "",
        });
        toast.success("Fusion updated");
      }
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog onClose={onClose} open={open} title={mode === "create" ? "Add Fusion" : "Edit Fusion"}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <Field error={form.formState.errors.materialA?.message} label="Material A">
            <Input
              {...form.register("materialA")}
              disabled={mode === "edit"}
              error={!!form.formState.errors.materialA}
            />
          </Field>
          <Field error={form.formState.errors.materialB?.message} label="Material B">
            <Input
              {...form.register("materialB")}
              disabled={mode === "edit"}
              error={!!form.formState.errors.materialB}
            />
          </Field>
        </div>
        <Field error={form.formState.errors.resultName?.message} label="Result Name">
          <Input {...form.register("resultName")} error={!!form.formState.errors.resultName} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field error={form.formState.errors.resultAttack?.message} label="Result ATK">
            <Input
              {...form.register("resultAttack", { valueAsNumber: true })}
              error={!!form.formState.errors.resultAttack}
              type="number"
            />
          </Field>
          <Field error={form.formState.errors.resultDefense?.message} label="Result DEF">
            <Input
              {...form.register("resultDefense", { valueAsNumber: true })}
              error={!!form.formState.errors.resultDefense}
              type="number"
            />
          </Field>
        </div>
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
