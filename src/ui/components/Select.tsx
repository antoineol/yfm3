import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = "", children, ...props }, ref) => {
    return (
      <select
        className={`w-full px-3 py-2 bg-bg-surface border rounded-lg text-sm text-text-primary transition-colors outline-none focus:ring-1 focus:ring-gold focus:border-gold disabled:opacity-40 disabled:cursor-not-allowed ${error ? "border-stat-atk" : "border-border-subtle"} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
