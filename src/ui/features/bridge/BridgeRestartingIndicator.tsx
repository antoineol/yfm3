export function BridgeRestartingIndicator() {
  return (
    <div className="max-w-sm mx-auto flex flex-col items-center gap-4 py-16 text-center">
      <div className="relative flex items-center justify-center size-12">
        <span className="absolute inset-0 rounded-full bg-gold/10 animate-ping" />
        <span className="relative inline-block size-3 rounded-full bg-gold animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-text-primary">
          Bridge is restarting&hellip;
        </p>
        <p className="text-xs text-text-muted">This usually takes a few seconds.</p>
      </div>
    </div>
  );
}
