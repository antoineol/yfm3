export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`animate-spin ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

export function Loader() {
  return (
    <div className="w-8 h-8 border-2 border-gold-dim border-t-gold rounded-full animate-spin-gold" />
  );
}

export function LoaderBlock() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader />
    </div>
  );
}
