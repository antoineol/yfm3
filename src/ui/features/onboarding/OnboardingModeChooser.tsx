import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { manualSetupModalOpenAtom } from "../../lib/atoms.ts";
import { useHash } from "../../lib/use-tab-from-hash.ts";

export function OnboardingModeChooser() {
  const updatePreferences = useUpdatePreferences();
  const [, setHash] = useHash();
  const setManualSetupOpen = useSetAtom(manualSetupModalOpenAtom);

  const handleChooseAutoSync = useCallback(() => {
    updatePreferences({ bridgeAutoSync: true });
  }, [updatePreferences]);

  const handleChooseManual = useCallback(() => {
    updatePreferences({ bridgeAutoSync: false });
    setManualSetupOpen(true);
    setHash("deck");
  }, [updatePreferences, setManualSetupOpen, setHash]);

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-6 py-8 px-4">
      <div className="text-center space-y-1.5">
        <h2 className="font-display text-xl font-bold text-gold tracking-wide">Getting started</h2>
        <p className="text-xs text-text-muted">You can switch anytime from the menu.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <ModeCard
          description="See your hand, fusions, and best plays live as you duel."
          onClick={handleChooseAutoSync}
          title="Auto-Sync"
          warning="Requires Windows"
        >
          <SyncIcon />
        </ModeCard>

        <ModeCard
          description="Build and optimize your deck offline. Works on any device."
          onClick={handleChooseManual}
          title="Manual"
        >
          <CardsIcon />
        </ModeCard>
      </div>
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────────

function ModeCard({
  title,
  description,
  warning,
  onClick,
  children,
}: {
  title: string;
  description: string;
  warning?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex-1 flex flex-col items-center gap-3 p-6 rounded-xl bg-bg-panel border border-border-subtle hover:border-gold-dim hover:shadow-glow-gold-sm transition-all cursor-pointer text-center group"
      onClick={onClick}
      type="button"
    >
      <span className="text-gold-dim group-hover:text-gold transition-colors">{children}</span>
      <span className="font-display text-base font-bold text-text-primary tracking-wide">
        {title}
      </span>
      <span className="text-xs text-text-muted leading-relaxed">{description}</span>
      {warning && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-950/20 text-yellow-400/90">
          {warning}
        </span>
      )}
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────

function SyncIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 4v4h-4M4 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      {/* Back card (offset right & up) */}
      <rect height="13" rx="1.5" width="9" x="11" y="3" />
      {/* Front card (offset left & down) */}
      <rect height="13" rx="1.5" width="9" x="4" y="8" />
    </svg>
  );
}
