export function AdminLogo({ className = "", size = "sidebar", showTagline = false }) {
  const sizes = {
    sidebar: "h-11 w-auto max-w-[190px]",
    header: "h-12 w-auto max-w-[220px]",
    login: "h-16 w-auto max-w-[300px]",
    form: "h-11 w-auto max-w-[190px]",
  };

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <img
        src="/application-logo.png"
        alt="Saliah Foods"
        className={`rounded-xl object-contain object-left ${sizes[size] ?? sizes.sidebar}`}
      />
      {showTagline && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
          Admin panel
        </p>
      )}
    </div>
  );
}
