export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-900/15 border-t-emerald-800" />
      <p className="text-sm text-emerald-900/50">{label}</p>
    </div>
  );
}
