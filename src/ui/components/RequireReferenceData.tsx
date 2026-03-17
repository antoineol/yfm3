import type { ReactNode } from "react";
import { useHasReferenceData } from "../lib/fusion-table-context.tsx";

export function RequireReferenceData({ children }: { children: ReactNode }) {
  const hasData = useHasReferenceData();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full text-text-muted">
        <p>No reference data loaded yet.</p>
        <a className="text-gold-dim hover:text-gold transition-colors underline" href="#data">
          Go to Data tab to sync from Google Sheets
        </a>
      </div>
    );
  }

  return children;
}
