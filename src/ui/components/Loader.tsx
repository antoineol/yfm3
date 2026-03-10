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
