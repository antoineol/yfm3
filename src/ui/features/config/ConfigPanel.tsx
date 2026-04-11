import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { TERRAIN_IDS, TERRAIN_NAMES } from "../../../engine/data/field-bonus.ts";
import { Form } from "../../components/Form.tsx";
import { Input } from "../../components/Input.tsx";
import { Select } from "../../components/Select.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import {
  useDeckSize,
  useFusionDepth,
  useTerrain,
  useUseEquipment,
} from "../../db/use-user-preferences.ts";
import { isOptimizingAtom } from "../../lib/atoms.ts";
import { type ConfigFormValues, configSchema } from "./config-schema.ts";
import { ImportExportButtons } from "./ImportExportButtons.tsx";

interface ConfigPanelProps {
  onClose: () => void;
}

export function ConfigPanel({ onClose }: ConfigPanelProps) {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const save = useUpdatePreferences();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    mode: "onChange",
    defaultValues: {
      deckSize: useDeckSize(),
      fusionDepth: useFusionDepth(),
      useEquipment: useUseEquipment(),
      terrain: useTerrain(),
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch((_values, { type }) => {
      if (type !== "change") return;
      void form.handleSubmit((values) => {
        save(values);
        toast.success("Settings saved");
      })();
    });
    return unsubscribe;
  }, [form, save]);

  return (
    <>
      <Form form={form}>
        <div className="grid grid-cols-2 gap-4">
          <ConfigInput disabled={isOptimizing} label="Scoring cards" name="deckSize" />
          <ConfigInput disabled={isOptimizing} label="Fusion depth" name="fusionDepth" />
        </div>
        <ConfigCheckbox
          disabled={isOptimizing}
          label="Use equipment"
          name="useEquipment"
          sublabel="+500 / +1000 equip boosts in deck optimization"
        />
        <TerrainSelect disabled={isOptimizing} />
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
}

export function ConfigInput({ name, label, disabled }: ConfigInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConfigFormValues>();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      <Input
        {...register(name, { valueAsNumber: true })}
        className="text-center font-mono"
        disabled={disabled}
        error={!!errors[name]}
        type="number"
      />
      <FieldError name={name} />
    </label>
  );
}

interface ConfigCheckboxProps {
  name: "useEquipment";
  label: string;
  sublabel?: string;
  disabled: boolean;
}

function ConfigCheckbox({ name, label, sublabel, disabled }: ConfigCheckboxProps) {
  const { register } = useFormContext<ConfigFormValues>();
  return (
    <div>
      <label className="flex items-start gap-2.5 mt-3 cursor-pointer select-none">
        <input
          {...register(name)}
          className="mt-0.5 accent-gold"
          disabled={disabled}
          type="checkbox"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
          {sublabel && (
            <span className="text-[11px] text-text-muted leading-tight">{sublabel}</span>
          )}
        </span>
      </label>
      <FieldError name={name} />
    </div>
  );
}

function FieldError({ name }: { name: keyof ConfigFormValues }) {
  const {
    formState: { errors },
  } = useFormContext<ConfigFormValues>();
  const error = errors[name];
  if (!error) return null;
  return <span className="text-[11px] text-stat-atk">{error.message ?? "Invalid value"}</span>;
}

function TerrainSelect({ disabled }: { disabled: boolean }) {
  const { register } = useFormContext<ConfigFormValues>();
  return (
    <div className="flex flex-col gap-1.5 mt-3">
      <label
        className="text-xs text-text-secondary uppercase tracking-wide"
        htmlFor="terrain-select"
      >
        Field
      </label>
      <Select
        {...register("terrain", { setValueAs: Number })}
        disabled={disabled}
        id="terrain-select"
      >
        <option value={0}>None</option>
        {TERRAIN_IDS.map((id) => (
          <option key={id} value={id}>
            {TERRAIN_NAMES[id]}
          </option>
        ))}
      </Select>
      <span className="text-[11px] text-text-muted leading-tight">
        Optimize deck for opponent's field (+500/-500 ATK)
      </span>
      <FieldError name="terrain" />
    </div>
  );
}
