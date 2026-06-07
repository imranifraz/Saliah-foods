import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageFile } from "../lib/cropImage.js";

export function ImageCropModal({
  open,
  imageSrc,
  fileName = "category-image.jpg",
  title = "Crop image",
  subtitle = "Adjust the square crop for your category image.",
  aspect = 1,
  onClose,
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels || !imageSrc) return;

    setProcessing(true);
    setError("");
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      await onConfirm(file);
    } catch (err) {
      setError(err.message ?? "Could not crop image.");
    } finally {
      setProcessing(false);
    }
  }

  if (!open || !imageSrc) return null;

  return (
    <div
      className="admin-modal fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close crop dialog"
        onClick={onClose}
      />

      <div
        className="admin-modal__panel admin-card relative z-10 flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:max-h-[min(40rem,calc(100dvh-2rem))] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="image-crop-title" className="font-display text-lg font-semibold text-[var(--admin-fg)]">
              {title}
            </h2>
            {subtitle ? <p className="admin-caption mt-1">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
            aria-label="Close"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div key={imageSrc} className="relative h-64 w-full overflow-hidden rounded-xl bg-[var(--admin-surface-2)] sm:h-72">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <label className="mt-4 block">
            <span className="admin-label">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full accent-[var(--admin-link)]"
              aria-label="Crop zoom"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button type="button" className="btn-ghost w-full sm:w-auto" disabled={processing} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary w-full sm:w-auto" disabled={processing} onClick={handleConfirm}>
            {processing ? "Applying…" : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
