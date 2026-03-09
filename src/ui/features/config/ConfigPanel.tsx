import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "../../components/Form.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { isOptimizingAtom } from "../../lib/atoms.ts";
import { type ConfigFormValues, configSchema } from "./config-schema.ts";

export function ConfigPanel() {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const save = useUpdatePreferences();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "onBlur",
    defaultValues: { deckSize, fusionDepth },
  });

  useEffect(() => {
    form.reset({ deckSize, fusionDepth });
  }, [deckSize, fusionDepth, form]);

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
    </Form>
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
      <input
        {...register(name, { valueAsNumber: true, onBlur })}
        className={`w-full px-3 py-2 bg-bg-surface border rounded-lg text-center font-mono text-sm text-text-primary transition-colors
					${errors[name] ? "border-stat-atk" : "border-border-subtle"}
					focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold
					disabled:opacity-40 disabled:cursor-not-allowed`}
        disabled={disabled}
        type="number"
      />
    </label>
  );
}
