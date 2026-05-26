/** Minimal OR separator — horizontal for stacked layouts, vertical for side-by-side */
export function AuthOrDivider({ orientation = "both", className = "" }) {
  const showHorizontal = orientation === "both" || orientation === "horizontal";
  const showVertical = orientation === "both" || orientation === "vertical";

  return (
    <>
      {showHorizontal ? (
        <div
          className={`flex items-center gap-4 py-2 ${orientation === "both" ? "md:hidden" : ""} ${className}`.trim()}
          role="separator"
        >
          <span className="h-px flex-1 bg-cream-200/90" aria-hidden />
          <span className="shrink-0 font-body text-xs font-medium uppercase tracking-wider text-emerald-900/35">
            Or
          </span>
          <span className="h-px flex-1 bg-cream-200/90" aria-hidden />
        </div>
      ) : null}

      {showVertical ? (
        <div
          className={`mx-5 hidden w-px shrink-0 self-stretch bg-cream-200/90 md:block lg:mx-6 ${className}`.trim()}
          role="separator"
          aria-label="Or"
        />
      ) : null}
    </>
  );
}
