import { useRef } from "react";
import { AccountBtn } from "./AccountUI";
import { AccountProfileAvatar } from "./AccountProfileAvatar";

export function AccountProfilePhotoUpload({
  name,
  avatarUrl,
  uploading = false,
  disabled = false,
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
    <div className="account-profile-photo">
      <div className="account-profile-photo__preview-wrap">
        <AccountProfileAvatar name={name} avatarUrl={avatarUrl} size="lg" />
        <button
          type="button"
          className="account-profile-photo__camera"
          aria-label="Upload profile photo"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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

      <div className="account-profile-photo__actions">
        <p className="account-profile-photo__label">Profile photo</p>
        <p className="account-profile-photo__hint">JPG, PNG or WebP. Max 2 MB.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AccountBtn variant="ghost" type="button" className="account-btn--sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload photo"}
          </AccountBtn>
          {avatarUrl ? (
            <AccountBtn variant="ghost" type="button" className="account-btn--sm" disabled={busy} onClick={onRemove}>
              Remove
            </AccountBtn>
          ) : null}
        </div>
      </div>
    </div>
  );
}
