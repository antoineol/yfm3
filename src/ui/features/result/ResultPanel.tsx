import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { PanelHeader } from "../../components/panel-chrome.tsx";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom, liveBestScoreAtom, resultAtom } from "../../lib/atoms.ts";
import { OptimizeButton } from "../optimize/OptimizeButton.tsx";
import { useOptimize } from "../optimize/use-optimize.ts";
import { OptimizationProgress } from "./OptimizationProgress.tsx";
import { SuggestedDeckComparison } from "./SuggestedDeckComparison.tsx";
import { useResultEntries } from "./use-result-entries.ts";

export function ResultPanel() {
  const data = useResultEntries();
  const { isOptimizing, optimize, cancel } = useOptimize();
  const setResult = useSetAtom(resultAtom);
  const acceptDeck = useAuthMutation(api.deck.acceptSuggestedDeck);
  const [accepting, setAccepting] = useState(false);
  const readOnly = useBridgeAutoSync();
  const liveDeckScore = useAtomValue(currentDeckScoreAtom);

  function handleAccept() {
    if (!data) return;
    setAccepting(true);
    acceptDeck({ cardIds: data.result.deck })
      .then(() => setResult(null))
      .catch((err) => console.error("Accept failed:", err))
      .finally(() => setAccepting(false));
  }

  function handleReject() {
    setResult(null);
  }

  if (!data && !isOptimizing) {
    return (
      <>
        <PanelHeader title="Suggested" />
        <ResultEmptyState />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <ResultHeader isOptimizing onCancel={cancel} />
        <OptimizationProgress />
      </>
    );
  }

  // Only use live deck score for percentage — result.currentDeckScore is stale
  // when the deck has changed since optimization ran.
  const improvementPct =
    liveDeckScore != null && liveDeckScore > 0
      ? (((data.result.expectedAtk - liveDeckScore) / liveDeckScore) * 100).toFixed(1)
      : null;

  return (
    <>
      <ResultHeader
        accepting={accepting}
        improvement={improvementPct}
        onAccept={readOnly ? undefined : handleAccept}
        onOptimize={optimize}
        onReject={readOnly ? undefined : handleReject}
        score={data.result.expectedAtk}
        swapCount={data.swapCount}
      />
      <SuggestedDeckComparison data={data} />
    </>
  );
}

/** Icon button used in the panel header. Large touch target, subtle styling. */
function HeaderAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center rounded-md transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function ResultHeader({
  score,
  improvement,
  accepting,
  isOptimizing,
  swapCount,
  onAccept,
  onReject,
  onOptimize,
  onCancel,
}: {
  score?: number;
  improvement?: string | null;
  accepting?: boolean;
  isOptimizing?: boolean;
  swapCount?: number;
  onAccept?: () => void;
  onReject?: () => void;
  onOptimize?: () => void;
  onCancel?: () => void;
}) {
  const liveBestScore = useAtomValue(liveBestScoreAtom);
  const displayScore = score ?? (liveBestScore > 0 ? liveBestScore : null);
  const progress = useTimerProgress(!!isOptimizing);

  return (
    <PanelHeader
      bottomBar={isOptimizing ? <ProgressBarFill progress={progress} /> : undefined}
      title="Suggested"
    >
      <div className="flex items-center gap-3">
        {/* Action buttons */}
        {onCancel && (
          <HeaderAction label="Cancel" onClick={onCancel}>
            <StopIcon />
          </HeaderAction>
        )}
        {onAccept && (
          <HeaderAction disabled={accepting} label="Accept deck" onClick={onAccept}>
            <CheckIcon />
          </HeaderAction>
        )}
        {onReject && (
          <HeaderAction disabled={accepting} label="Reject" onClick={onReject}>
            <XIcon />
          </HeaderAction>
        )}
        {onOptimize && (
          <HeaderAction disabled={accepting} label="Re-run" onClick={onOptimize}>
            <RedoIcon />
          </HeaderAction>
        )}

        {/* Swap count */}
        {swapCount != null && swapCount > 0 && (
          <span className="text-sm lg:text-xs text-text-secondary">
            {String(swapCount)} swap{swapCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Score */}
        {displayScore != null && (
          <div className="flex items-baseline gap-1.5 ml-1">
            <span className="text-sm lg:text-xs text-text-secondary uppercase tracking-wide">
              ATK
            </span>
            <span className="font-mono font-bold text-base lg:text-sm text-gold">
              {score == null && "~"}
              {displayScore.toFixed(1)}
            </span>
            {improvement && (
              <span
                className={`font-mono text-xs ${improvement.startsWith("-") ? "text-stat-down" : "text-stat-up"}`}
              >
                {improvement.startsWith("-") ? `${improvement}%` : `+${improvement}%`}
              </span>
            )}
          </div>
        )}
      </div>
    </PanelHeader>
  );
}

function ResultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-3 gap-4 text-center">
      <p className="text-gold/60 font-display text-sm uppercase tracking-wide">
        Awaiting optimization
      </p>
      <div
        className="w-32 h-0.5 rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)",
        }}
      />
      <OptimizeButton />
    </div>
  );
}

/* ── Progress bar fill (rendered inside PanelHeader's bottomBar slot) ── */

function ProgressBarFill({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  return (
    <div
      className="h-full rounded-full"
      style={{
        width: `${pct}%`,
        background:
          "linear-gradient(90deg, var(--color-gold-dim), var(--color-gold), var(--color-gold-bright))",
        boxShadow: "0 0 6px var(--color-gold-dim)",
        transition: "width 300ms ease-out",
      }}
    />
  );
}

/* ── Timer hook ── */

/** Default optimization time budget in ms (matches orchestrator DEFAULT_TIME_LIMIT). */
const TIME_BUDGET_MS = 15_000;

/** Client-side timer that returns smooth progress ratio (0-1) while active. */
function useTimerProgress(active: boolean): number {
  const startRef = useRef(performance.now());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    startRef.current = performance.now();
    const id = setInterval(() => {
      const elapsedMs = performance.now() - startRef.current;
      setProgress(Math.min(elapsedMs / TIME_BUDGET_MS, 1));
    }, 200);
    return () => clearInterval(id);
  }, [active]);

  return progress;
}

/* ── Inline SVG icons (16x16) ── */

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 16 16"
    >
      <path d="M3 8.5l3.5 3.5 6.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 16 16"
    >
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 16 16"
    >
      <path d="M11 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6H6.5a4 4 0 100 8H10" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
      <rect height="8" rx="1.5" width="8" x="4" y="4" />
    </svg>
  );
}
