export function AdminLogo({ className = "", size = "sidebar", showTagline = false, variant = "light" }) {
  const sizes = {
    sidebar: "h-10 w-auto max-w-[180px]",
    header: "h-12 w-auto max-w-[220px]",
    login: "h-16 w-auto max-w-[300px]",
    form: "h-11 w-auto max-w-[190px]",
  };

  const isDark = variant === "dark";

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      {isDark ? (
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-gold-400">Saliah Foods</p>
          {showTagline ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cream-50/70">Admin Panel</p>
          ) : null}
        </div>
      ) : (
        <>
          <img
            src="/application-logo.png"
            alt="Saliah Foods"
            className={`rounded-xl object-contain object-left ${sizes[size] ?? sizes.sidebar}`}
          />
          {showTagline ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">Admin panel</p>
          ) : null}
        </>
      )}
    </div>
  );
}
