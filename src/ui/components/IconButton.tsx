import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children?: ReactNode;
}

export function IconButton({ label, children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`size-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-gold ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
