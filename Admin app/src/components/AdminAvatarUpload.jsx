import { useRef } from "react";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";

function AvatarPreview({ name, avatarUrl, size = "md" }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = size === "sm" ? "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl" : "h-20 w-20 text-2xl";
  const src = avatarUrl ? resolveAdminMediaUrl(avatarUrl) : "";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`admin-profile-avatar shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <span
      className={`admin-profile-avatar flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white ${sizeClass}`}
    >
      {initials}
    </span>
  );
}

export function AdminAvatarUpload({
  name,
  avatarUrl,
  uploading = false,
  disabled = false,
  compact = false,
  onUpload,
  onRemove,
}) {
  const inputRef = useRef(null);
  const busy = disabled || uploading;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className={compact ? "flex items-center gap-3 sm:gap-4" : "flex flex-col items-center"}>
      <div className="relative shrink-0">
        <AvatarPreview name={name} avatarUrl={avatarUrl} size={compact ? "sm" : "md"} />
        <button
          type="button"
          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-link)] shadow-sm transition hover:bg-[var(--admin-hover)] disabled:opacity-50 sm:h-8 sm:w-8"
          aria-label="Upload profile photo"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className={compact ? "min-w-0 flex-1" : "mt-3 flex flex-col items-center"}>
        {compact ? <p className="admin-label">Profile photo</p> : null}
        <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "justify-center"}`}>
          <button
            type="button"
            className="btn-ghost text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          {avatarUrl ? (
            <button type="button" className="btn-ghost text-xs" disabled={busy} onClick={onRemove}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
