import { useState } from "react";
import type { BridgeDetail, EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { BRIDGE_DOWNLOAD_URL } from "./bridge-constants.ts";

export function BridgeSetupGuide({ bridge }: { bridge: EmulatorBridge }) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <StatusBanner detail={bridge.detail} detailMessage={bridge.detailMessage} />
      <SetupSteps detail={bridge.detail} />
      <Troubleshooting />
    </div>
  );
}

// ── Status banner ─────────────────────────────────────────────────

function StatusBanner({
  detail,
  detailMessage,
}: {
  detail: BridgeDetail;
  detailMessage: string | null;
}) {
  const config = STATUS_CONFIG[detail];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg ${config.bg}`}>
      <span className={`mt-0.5 inline-block size-2.5 rounded-full shrink-0 ${config.dot}`} />
      <div className="min-w-0">
        <p className={`text-sm font-medium ${config.text}`}>{config.label}</p>
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
    label: "DuckStation not found — open DuckStation and load the game",
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

// ── Setup steps ───────────────────────────────────────────────────

const STEP_DONE = "completed";
const STEP_ACTIVE = "active";
const STEP_PENDING = "pending";
type StepState = typeof STEP_DONE | typeof STEP_ACTIVE | typeof STEP_PENDING;

function stepStatesForDetail(detail: BridgeDetail): [StepState, StepState, StepState, StepState] {
  // Steps: 0=download, 1=run bridge, 2=open DuckStation, 3=enable shared memory
  switch (detail) {
    case "ready":
      return [STEP_DONE, STEP_DONE, STEP_DONE, STEP_DONE];
    case "no_shared_memory":
      return [STEP_DONE, STEP_DONE, STEP_DONE, STEP_ACTIVE];
    case "emulator_not_found":
      return [STEP_DONE, STEP_DONE, STEP_ACTIVE, STEP_PENDING];
    case "bridge_not_found":
      return [STEP_ACTIVE, STEP_PENDING, STEP_PENDING, STEP_PENDING];
    case "error":
      return [STEP_DONE, STEP_DONE, STEP_PENDING, STEP_PENDING];
  }
}

function SetupSteps({ detail }: { detail: BridgeDetail }) {
  const states = stepStatesForDetail(detail);

  return (
    <div className="rounded-xl bg-bg-panel border border-border-subtle p-4 space-y-1">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Setup</p>

      <p className="text-xs text-text-muted mb-3">
        Requires <strong className="text-text-secondary">Windows</strong> and{" "}
        <strong className="text-text-secondary">DuckStation</strong> emulator.
      </p>

      <Step number={1} state={states[0]} title="Download the bridge">
        <a
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-md bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition-colors"
          download
          href={BRIDGE_DOWNLOAD_URL}
          rel="noopener noreferrer"
        >
          <DownloadIcon />
          Download yfm-bridge
        </a>
      </Step>

      <Step
        number={2}
        state={states[1]}
        title="Extract the zip and double-click start-bridge.bat"
      />

      <Step
        number={3}
        state={states[2]}
        title="Open DuckStation and load the FM Remastered Perfected ROM"
      />

      <Step number={4} state={states[3]} title="Enable shared memory export in DuckStation">
        <DuckStationInstructions />
      </Step>
    </div>
  );
}

function Step({
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
              ? "bg-gold/20 text-gold"
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

function DuckStationInstructions() {
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

// ── Troubleshooting ───────────────────────────────────────────────

function Troubleshooting() {
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

// ── Icons ─────────────────────────────────────────────────────────

function DownloadIcon() {
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

function CheckIcon() {
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
