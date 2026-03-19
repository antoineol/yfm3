export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  toHref,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  toHref?: (value: T) => string;
}) {
  return (
    <div className="flex w-fit rounded-md border border-border-subtle overflow-hidden text-xs">
      {options.map((option) => (
        <ToggleOption
          active={value === option.value}
          href={toHref?.(option.value)}
          key={option.value}
          label={option.label}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

function ToggleOption({
  label,
  active,
  onClick,
  href,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  href?: string;
}) {
  const className = `px-3 py-1 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-gold ${
    active ? "bg-gold-dim/30 text-gold-bright" : "text-text-muted hover:text-text-secondary"
  }`;

  if (href) {
    return (
      <a
        className={className}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {label}
    </button>
  );
}
