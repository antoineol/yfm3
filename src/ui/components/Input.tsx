import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        className={`w-full px-3 py-2 bg-bg-surface border rounded-lg text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none focus:ring-1 focus:ring-gold focus:border-gold disabled:opacity-40 disabled:cursor-not-allowed ${error ? "border-stat-atk" : "border-border-subtle"} ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);
