import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { getCroppedImageFile } from "../lib/cropImage.js";

async function getFallbackSquareCrop(imageSrc) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Could not load image for cropping.")));
    if (typeof imageSrc === "string" && !imageSrc.startsWith("blob:") && !imageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.src = imageSrc;
  });

  const size = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const x = Math.max(0, Math.floor(((image.naturalWidth || image.width) - size) / 2));
  const y = Math.max(0, Math.floor(((image.naturalHeight || image.height) - size) / 2));
  return { x, y, width: size, height: size };
}

export function ImageCropModal({
  open,
  imageSrc,
  fileName = "category-image.jpg",
  title = "Crop image",
  subtitle = "Adjust the square crop, then add it to the form.",
  aspect = 1,
  outputSize,
  onClose,
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const cropPixelsRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    cropPixelsRef.current = null;
    setError("");
    setProcessing(false);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!processing) onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, processing]);

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    cropPixelsRef.current = croppedPixels;
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || processing) return;

    setProcessing(true);
    setError("");
    try {
      const pixels = cropPixelsRef.current || croppedAreaPixels || (await getFallbackSquareCrop(imageSrc));
      if (!pixels?.width || !pixels?.height) {
        throw new Error("Crop is not ready yet. Move the image slightly, then try again.");
      }
      const file = await getCroppedImageFile(imageSrc, pixels, fileName, { outputSize });
      await onConfirm(file);
    } catch (err) {
      setError(err.message ?? "Could not crop image.");
      setProcessing(false);
    }
  }

  function handleCancel() {
    if (processing) return;
    onClose?.();
  }

  if (!open || !imageSrc || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={handleCancel}
      />

      <div
        className="admin-modal__panel admin-card relative z-10 flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:max-h-[min(40rem,calc(100dvh-2rem))] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="image-crop-title" className="font-display text-lg font-semibold text-[var(--admin-fg)]">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-[var(--admin-fg-muted)]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
            aria-label="Close crop dialog"
            disabled={processing}
            onClick={handleCancel}
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

        <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button type="button" className="btn-ghost w-full sm:w-auto" disabled={processing} onClick={handleCancel}>
            Back to form
          </button>
          <button type="button" className="btn-primary w-full sm:w-auto" disabled={processing} onClick={handleConfirm}>
            {processing ? "Adding…" : "Add image to form"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
