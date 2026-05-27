export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-accent)]" />
      <p className="admin-muted text-sm font-medium">{label}</p>
    </div>
  );
}
