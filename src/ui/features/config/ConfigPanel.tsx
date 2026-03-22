import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "../../components/Form.tsx";
import { Input } from "../../components/Input.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useDeckSize, useFusionDepth, useUseEquipment } from "../../db/use-user-preferences.ts";
import { isOptimizingAtom } from "../../lib/atoms.ts";
import { type ConfigFormValues, configSchema } from "./config-schema.ts";
import { ImportExportButtons } from "./ImportExportButtons.tsx";

interface ConfigPanelProps {
  onClose: () => void;
}

export function ConfigPanel({ onClose }: ConfigPanelProps) {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const useEquipment = useUseEquipment();
  const save = useUpdatePreferences();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "onBlur",
    defaultValues: { deckSize, fusionDepth, useEquipment },
  });

  useEffect(() => {
    form.reset({ deckSize, fusionDepth, useEquipment });
  }, [deckSize, fusionDepth, useEquipment, form]);

  const saveWithToast = (values: ConfigFormValues) => {
    if (!form.formState.isDirty) return;
    save(values);
    form.reset(values);
    toast.success("Settings saved");
  };

  const submitOnBlur = () => {
    void form.handleSubmit(saveWithToast)();
  };

  return (
    <>
      <Form form={form} onSubmit={saveWithToast}>
        <div className="grid grid-cols-2 gap-4">
          <ConfigInput
            disabled={isOptimizing}
            label="Deck size"
            name="deckSize"
            onBlur={submitOnBlur}
          />
          <ConfigInput
            disabled={isOptimizing}
            label="Fusion depth"
            name="fusionDepth"
            onBlur={submitOnBlur}
          />
        </div>
        <ConfigCheckbox
          disabled={isOptimizing}
          label="Use equipment"
          name="useEquipment"
          onChange={submitOnBlur}
          sublabel="+500 / +1000 equip boosts in deck optimization"
        />
      </Form>
      <hr className="my-4 border-border-subtle" />
      <ImportExportButtons onImportDone={onClose} />
    </>
  );
}

interface ConfigInputProps {
  name: keyof ConfigFormValues;
  label: string;
  disabled: boolean;
  onBlur: () => void;
}

export function ConfigInput({ name, label, disabled, onBlur }: ConfigInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConfigFormValues>();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      <Input
        {...register(name, { valueAsNumber: true, onBlur })}
        className="text-center font-mono"
        disabled={disabled}
        error={!!errors[name]}
        type="number"
      />
    </label>
  );
}

interface ConfigCheckboxProps {
  name: "useEquipment";
  label: string;
  sublabel?: string;
  disabled: boolean;
  onChange: () => void;
}

function ConfigCheckbox({ name, label, sublabel, disabled, onChange }: ConfigCheckboxProps) {
  const { register } = useFormContext<ConfigFormValues>();
  return (
    <label className="flex items-start gap-2.5 mt-3 cursor-pointer select-none">
      <input
        {...register(name, { onChange })}
        className="mt-0.5 accent-gold"
        disabled={disabled}
        type="checkbox"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
        {sublabel && <span className="text-[11px] text-text-muted leading-tight">{sublabel}</span>}
      </span>
    </label>
  );
}
