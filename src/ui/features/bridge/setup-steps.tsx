import { useState } from "react";
import type { BridgeDetail } from "../../lib/use-emulator-bridge.ts";

// ── Step state ───────────────────────────────────────────────────

export const STEP_DONE = "completed";
export const STEP_ACTIVE = "active";
export const STEP_PENDING = "pending";
export type StepState = typeof STEP_DONE | typeof STEP_ACTIVE | typeof STEP_PENDING;

export function stepStatesForDetail(
  detail: BridgeDetail,
): [StepState, StepState, StepState, StepState, StepState] {
  switch (detail) {
    case "ready":
      return [STEP_DONE, STEP_DONE, STEP_DONE, STEP_DONE, STEP_DONE];
    case "waiting_for_game":
      return [STEP_DONE, STEP_DONE, STEP_DONE, STEP_DONE, STEP_ACTIVE];
    case "no_shared_memory":
      return [STEP_DONE, STEP_DONE, STEP_DONE, STEP_ACTIVE, STEP_PENDING];
    case "emulator_not_found":
      return [STEP_DONE, STEP_DONE, STEP_ACTIVE, STEP_PENDING, STEP_PENDING];
    case "bridge_not_found":
      return [STEP_ACTIVE, STEP_ACTIVE, STEP_PENDING, STEP_PENDING, STEP_PENDING];
    case "error":
      return [STEP_DONE, STEP_DONE, STEP_ACTIVE, STEP_PENDING, STEP_PENDING];
  }
}

// ── Step ─────────────────────────────────────────────────────────

export function Step({
  number,
  state,
  title,
  children,
}: {
  number: number;
  state: StepState;
  title: string;
  children?: React.ReactNode;
}) {
  const isDone = state === STEP_DONE;
  const isActive = state === STEP_ACTIVE;

  return (
    <div className={`flex gap-3 py-2 ${state === STEP_PENDING ? "opacity-40" : ""}`}>
      <span
        className={`shrink-0 flex items-center justify-center size-6 rounded-full text-xs font-bold ${
          isDone
            ? "bg-green-400/20 text-green-400"
            : isActive
              ? "bg-gold/20 text-gold animate-pulse"
              : "bg-surface-secondary text-text-muted"
        }`}
      >
        {isDone ? <CheckIcon /> : number}
      </span>
      <div className="min-w-0">
        <p
          className={`text-sm ${isDone ? "text-text-muted line-through" : isActive ? "text-text-primary" : "text-text-secondary"}`}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

// ── Composite steps ──────────────────────────────────────────────

export function OptionalDownloadStep({
  number,
  title,
  downloadUrl,
  downloadLabel,
}: {
  number: number;
  title: string;
  downloadUrl: string;
  downloadLabel: string;
}) {
  return (
    <Step number={number} state={STEP_ACTIVE} title={title}>
      <DownloadLink href={downloadUrl}>{downloadLabel}</DownloadLink>
    </Step>
  );
}

// ── Status banner ────────────────────────────────────────────────

export function StatusBanner({
  detail,
  detailMessage,
  settingsPatched,
}: {
  detail: BridgeDetail;
  detailMessage: string | null;
  settingsPatched?: boolean;
}) {
  const config = STATUS_CONFIG[detail];
  const label =
    detail === "no_shared_memory" && settingsPatched
      ? "Shared memory export enabled — restart DuckStation to apply"
      : config.label;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config.bg}`}>
      <span className={`mt-0.5 inline-block size-2.5 rounded-full shrink-0 ${config.dot}`} />
      <div className="min-w-0">
        <p className={`text-sm font-medium ${config.text}`}>{label}</p>
        {detailMessage && detail === "error" && (
          <p className="mt-1 text-xs text-text-muted break-all font-mono">{detailMessage}</p>
        )}
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<
  BridgeDetail,
  { label: string; dot: string; bg: string; text: string }
> = {
  bridge_not_found: {
    label: "Bridge not found — download and run the bridge",
    dot: "bg-neutral-500",
    bg: "bg-surface-secondary",
    text: "text-text-secondary",
  },
  emulator_not_found: {
    label: "DuckStation not found — open DuckStation",
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-950/20",
    text: "text-yellow-400/90",
  },
  no_shared_memory: {
    label: "Shared memory not enabled — enable it in DuckStation settings",
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-950/20",
    text: "text-yellow-400/90",
  },
  waiting_for_game: {
    label: "Start or load a game in DuckStation",
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-950/20",
    text: "text-yellow-400/90",
  },
  ready: {
    label: "Connected",
    dot: "bg-green-400",
    bg: "bg-green-950/20",
    text: "text-green-400",
  },
  error: {
    label: "Unexpected error",
    dot: "bg-red-400",
    bg: "bg-red-950/20",
    text: "text-red-400",
  },
};

export function DuckStationInstructions() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? "Hide" : "Show"} detailed instructions
      </button>
      {open && (
        <ol className="mt-2 ml-4 list-decimal text-xs text-text-secondary space-y-1">
          <li>Open DuckStation</li>
          <li>
            Go to <strong>Settings</strong> &gt; <strong>Advanced</strong>
          </li>
          <li>
            Check <strong>Export Shared Memory</strong>
          </li>
          <li>Restart the game if it was already running</li>
        </ol>
      )}
    </div>
  );
}

export function Troubleshooting() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-bg-panel border border-border-subtle px-4 py-3">
      <button
        className="w-full flex items-center justify-between text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="uppercase tracking-wide">Troubleshooting</span>
        <span className="text-lg leading-none">{open ? "\u2212" : "+"}</span>
      </button>
      {open && (
        <dl className="mt-3 space-y-2 text-xs">
          <TroubleshootItem
            answer={
              'Click "More info" then "Run anyway". The bridge uses an unsigned Node.js binary.'
            }
            question="Windows SmartScreen blocks the bridge"
          />
          <TroubleshootItem
            answer="Click Allow for private networks. The bridge only communicates on localhost."
            question="Windows Firewall asks for permission"
          />
          <TroubleshootItem
            answer="Close other bridge instances, or check if another application is using port 3333."
            question="Port 3333 is already in use"
          />
          <TroubleshootItem
            answer="Make sure DuckStation is running before you start the bridge."
            question="Bridge says DuckStation not found"
          />
        </dl>
      )}
    </div>
  );
}

function TroubleshootItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <dt className="font-medium text-text-secondary">{question}</dt>
      <dd className="mt-0.5 text-text-muted">{answer}</dd>
    </div>
  );
}

// ── Shared UI ────────────────────────────────────────────────────

export function SwitchModeLink({
  label = "Switch mode",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1">
      <span>Not what you wanted?</span>
      <button
        className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-2 cursor-pointer"
        onClick={onClick}
        type="button"
      >
        {label}
      </button>
    </div>
  );
}

export function DownloadLink({
  href,
  children,
  download: isDownload,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  download?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-md bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition-colors"
      download={isDownload}
      href={href}
      onClick={onClick}
      rel="noopener noreferrer"
      target={isDownload ? undefined : "_blank"}
    >
      <DownloadIcon />
      {children}
    </a>
  );
}

// ── Icons ────────────────────────────────────────────────────────

export function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
      <line strokeLinecap="round" strokeLinejoin="round" x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
