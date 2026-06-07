const LOGO = {
  dark: "/application-dark-logo.png",
  default: "/application-logo.webp",
};

export function AdminLogo({ className = "", size = "sidebar", showTagline = false, variant = "light" }) {
  const sizes = {
    sidebar: "h-11 w-auto max-w-[210px]",
    icon: "h-9 w-9 object-center",
    header: "h-12 w-auto max-w-[220px]",
    login: "h-16 w-auto max-w-[300px]",
    form: "h-11 w-auto max-w-[190px]",
  };

  const isDark = variant === "dark";
  const isBrand = variant === "brand";
  const isBrandNative = variant === "brandNative";
  const sizeClass = sizes[size] ?? sizes.sidebar;

  const logoSrc = isDark ? LOGO.dark : LOGO.default;
  const logoClass = [
    "object-contain",
    isBrand
      ? "object-center brightness-0 invert rounded-xl"
      : isBrandNative
        ? "object-center rounded-xl"
        : "object-left rounded-xl",
    sizeClass,
  ].join(" ");

  const taglineClass = isBrand || isBrandNative
    ? "text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
    : isDark
      ? "text-[10px] font-bold uppercase tracking-[0.22em] text-cream-50/70"
      : "text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300";

  return (
    <div className={`flex flex-col gap-1 ${className || "items-start"}`}>
      <img src={logoSrc} alt="Saliah Foods" className={logoClass} decoding="async" />
      {showTagline ? <p className={taglineClass}>Admin panel</p> : null}
    </div>
  );
}
