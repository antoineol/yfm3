import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glowing?: boolean;
}

const variantStyles: Record<ButtonVariant, { base: string; enabled: string; disabled: string }> = {
  solid: {
    base: "font-bold uppercase tracking-wider",
    enabled:
      "bg-gold text-bg-deep hover:bg-gold-bright hover:shadow-[0_0_20px_var(--color-gold-dim)] cursor-pointer",
    disabled: "bg-gold-dim/40 text-text-muted cursor-not-allowed",
  },
  outline: {
    base: "font-medium border",
    enabled:
      "bg-bg-panel border-gold-dim text-gold hover:border-gold hover:shadow-[0_0_16px_var(--color-gold-dim)] cursor-pointer",
    disabled: "bg-bg-panel border-gold-dim/50 text-text-muted opacity-50 cursor-not-allowed",
  },
  ghost: {
    base: "",
    enabled: "text-text-muted hover:text-text-secondary cursor-pointer",
    disabled: "text-text-muted/50 cursor-not-allowed",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm rounded-md",
  md: "px-5 py-1.5 text-sm rounded-md",
  lg: "px-8 py-3 text-base rounded-lg",
};

export function Button({
  variant = "solid",
  size = "md",
  glowing,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "transition-all",
        v.base,
        s,
        disabled ? v.disabled : v.enabled,
        glowing && !disabled ? "animate-[pulse-glow_2s_ease-in-out_infinite]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
