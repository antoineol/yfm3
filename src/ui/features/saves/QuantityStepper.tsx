const MAX_QUANTITY = 255;

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  function setClamped(next: number) {
    const clamped = Math.max(0, Math.min(MAX_QUANTITY, Math.floor(next)));
    if (clamped !== value) onChange(clamped);
  }

  const owned = value > 0;

  return (
    <div
      className={`inline-flex items-stretch rounded-md border overflow-hidden transition-colors ${
        owned ? "border-gold-dim/60 bg-bg-surface" : "border-border-subtle bg-bg-panel/60"
      } focus-within:border-gold focus-within:ring-1 focus-within:ring-gold`}
    >
      <button
        aria-label="Decrease quantity"
        className="w-8 text-text-secondary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base cursor-pointer"
        disabled={value <= 0}
        onClick={() => setClamped(value - 1)}
        type="button"
      >
        −
      </button>
      <input
        className="w-12 bg-transparent text-center font-mono text-sm text-text-primary outline-none tabular-nums"
        inputMode="numeric"
        max={MAX_QUANTITY}
        min={0}
        onChange={(e) => {
          const parsed = Number.parseInt(e.target.value, 10);
          if (Number.isFinite(parsed)) setClamped(parsed);
          else if (e.target.value === "") onChange(0);
        }}
        onFocus={(e) => e.target.select()}
        type="number"
        value={value}
      />
      <button
        aria-label="Increase quantity"
        className="w-8 text-text-secondary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base cursor-pointer"
        disabled={value >= MAX_QUANTITY}
        onClick={() => setClamped(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
