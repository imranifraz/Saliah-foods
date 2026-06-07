import { resolveMediaUrl } from "../../lib/api.js";

const SIZE_CLASS = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-[3.25rem] w-[3.25rem] text-[15px] shadow-[0_4px_16px_rgba(22,49,42,0.22)]",
  lg: "h-20 w-20 text-xl shadow-[0_6px_20px_rgba(22,49,42,0.18)] sm:h-24 sm:w-24 sm:text-2xl",
};

function initialsFromName(name) {
  return (name ?? "S")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountProfileAvatar({ name, avatarUrl, size = "md", className = "" }) {
  const initials = initialsFromName(name);
  const src = avatarUrl ? resolveMediaUrl(avatarUrl) : "";
  const baseClass =
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 font-display font-medium text-cream-50 ring-2 ring-white/80";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${baseClass} object-cover ${SIZE_CLASS[size]} ${className}`.trim()}
      />
    );
  }

  return (
    <span className={`${baseClass} ${SIZE_CLASS[size]} ${className}`.trim()} aria-hidden>
      {initials}
    </span>
  );
}
