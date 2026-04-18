import { cardKinds } from "../../../engine/data/rp-types.ts";
import { Input } from "../../components/Input.tsx";
import { Select } from "../../components/Select.tsx";

export interface BuyFilters {
  kind: string;
  minAtk: number;
  maxCost: number;
  hideFullyStocked: boolean;
}

export function BuyFilterBar({
  filters,
  onChange,
}: {
  filters: BuyFilters;
  onChange: (next: BuyFilters) => void;
}) {
  const set = <K extends keyof BuyFilters>(key: K, value: BuyFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex items-center gap-4 flex-wrap text-xs text-text-secondary">
      <div className="flex items-center gap-2">
        <label htmlFor="buy-kind">Kind</label>
        <Select
          className="w-auto! py-1!"
          id="buy-kind"
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
        <label htmlFor="buy-min-atk">Min ATK</label>
        <input
          className="accent-gold"
          id="buy-min-atk"
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
        <label htmlFor="buy-max-cost">Max cost</label>
        <Input
          className="w-28! py-1!"
          id="buy-max-cost"
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
          id="buy-hide-stocked"
          onChange={(e) => set("hideFullyStocked", e.target.checked)}
          type="checkbox"
        />
        <label className="cursor-pointer" htmlFor="buy-hide-stocked">
          Hide fully-stocked (≥3)
        </label>
      </div>
    </div>
  );
}
