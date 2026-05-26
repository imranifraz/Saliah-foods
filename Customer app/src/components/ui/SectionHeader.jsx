export function SectionHeader({ id, eyebrow, title, subtitle, align = "center", className = "" }) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "mx-auto max-w-2xl text-center";

  return (
    <header className={`${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-600">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={`font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-tight text-emerald-900 ${
          eyebrow ? "mt-3" : ""
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 font-body text-sm leading-relaxed text-emerald-900/65 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
