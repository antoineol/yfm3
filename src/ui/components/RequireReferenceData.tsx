import type { ReactNode } from "react";
import { useHasReferenceData } from "../lib/fusion-table-context.tsx";

export function RequireReferenceData({ children }: { children: ReactNode }) {
  const hasData = useHasReferenceData();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full text-text-muted">
        <p>Loading card data...</p>
      </div>
    );
  }

  return children;
}
