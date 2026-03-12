import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "add" | "remove" | "to-deck" | "from-deck" | "dismiss";

const base =
  "h-8 min-w-[32px] inline-flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

const variantStyles: Record<Variant, string> = {
  add: `${base} hover:bg-gold/20 text-text-secondary hover:text-text-primary text-base font-bold`,
  remove: `${base} hover:bg-stat-atk/20 text-text-secondary hover:text-text-primary text-base font-bold`,
  "to-deck": `${base} hover:bg-gold/20 text-text-secondary hover:text-gold`,
  "from-deck": `${base} hover:bg-stat-atk/20 text-text-secondary hover:text-text-primary`,
  dismiss: `${base} text-text-muted hover:text-text-primary`,
};

export function CardActionButton({
  variant,
  children,
  ...props
}: { variant: Variant; children: ReactNode } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
>) {
  return (
    <button className={variantStyles[variant]} type="button" {...props}>
      {children}
    </button>
  );
}
