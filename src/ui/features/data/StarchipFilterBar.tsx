import { cardKinds } from "../../../engine/data/rp-types.ts";
import { Input } from "../../components/Input.tsx";
import { Select } from "../../components/Select.tsx";

export interface StarchipFilters {
  kind: string;
  minAtk: number;
  maxCost: number;
  hideFullyStocked: boolean;
}

export function StarchipFilterBar({
  filters,
  onChange,
}: {
  filters: StarchipFilters;
  onChange: (next: StarchipFilters) => void;
}) {
  const set = <K extends keyof StarchipFilters>(key: K, value: StarchipFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex items-center gap-4 flex-wrap text-xs text-text-secondary">
      <div className="flex items-center gap-2">
        <label htmlFor="starchip-kind">Kind</label>
        <Select
          className="w-auto! py-1!"
          id="starchip-kind"
          onChange={(e) => set("kind", e.target.value)}
          value={filters.kind}
        >
          <option value="all">All</option>
          {cardKinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="starchip-min-atk">Min ATK</label>
        <input
          className="accent-gold"
          id="starchip-min-atk"
          max={3500}
          min={0}
          onChange={(e) => set("minAtk", Number(e.target.value))}
          step={100}
          type="range"
          value={filters.minAtk}
        />
        <span className="font-mono text-text-primary w-12 text-right">{filters.minAtk}</span>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="starchip-max-cost">Max cost</label>
        <Input
          className="w-28! py-1!"
          id="starchip-max-cost"
          min={0}
          onChange={(e) => set("maxCost", Number(e.target.value))}
          type="number"
          value={filters.maxCost}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          checked={filters.hideFullyStocked}
          className="accent-gold cursor-pointer"
          id="starchip-hide-stocked"
          onChange={(e) => set("hideFullyStocked", e.target.checked)}
          type="checkbox"
        />
        <label className="cursor-pointer" htmlFor="starchip-hide-stocked">
          Hide fully-stocked (≥3)
        </label>
      </div>
    </div>
  );
}
