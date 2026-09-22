import { useSiteBrand } from "../context/SiteBrandContext.jsx";

/**
 * Display sizes match the customer app header logo:
 * mobile ~110px wide, desktop ~150px wide.
 * `icon` uses the same CMS logo (cropped/contained) so admin stays in sync.
 */
const SIZES = {
  sidebar: "h-auto w-[110px] max-w-full md:w-[150px]",
  header: "h-auto w-[110px] max-w-full md:w-[150px]",
  form: "h-auto w-[110px] max-w-full md:w-[150px]",
  login: "h-auto w-[150px] max-w-full sm:w-[180px]",
  icon: "h-9 w-9 shrink-0 object-contain",
};

export function AdminLogo({ className = "", size = "sidebar", showTagline = false, variant = "light" }) {
  const { siteLogoSrc, markSrc } = useSiteBrand();
  const isBrand = variant === "brand";
  const isBrandNative = variant === "brandNative";
  const isIcon = size === "icon";
  const sizeClass = SIZES[size] ?? SIZES.sidebar;
  const src = isIcon ? markSrc : siteLogoSrc;

  const logoClass = [
    "block bg-transparent object-contain",
    isBrand
      ? "object-center brightness-0 invert"
      : isBrandNative
        ? "object-center"
        : isIcon
          ? "object-center"
          : "object-left",
    sizeClass,
  ].join(" ");

  const taglineClass =
    isBrand || isBrandNative
      ? "text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
      : variant === "dark"
        ? "text-[10px] font-bold uppercase tracking-[0.22em] text-cream-50/70"
        : "text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300";

  return (
    <div className={`flex flex-col gap-1 ${className || "items-start"}`}>
      {src ? (
        <img
          src={src}
          alt="Saliah Foods"
          width={isIcon ? 36 : 150}
          height={isIcon ? 36 : 49}
          className={logoClass}
          decoding="async"
        />
      ) : (
        <div
          className={`${sizeClass} ${isIcon ? "" : "min-h-[2rem]"} bg-transparent`}
          aria-hidden
        />
      )}
      {showTagline ? <p className={taglineClass}>Admin panel</p> : null}
    </div>
  );
}
