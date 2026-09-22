import { useEffect, useRef, useState } from "react";
import { cmsImageSrc, uploadCmsImage } from "../lib/cmsUpload.js";
import { ImageCropModal } from "./ImageCropModal.jsx";

const BLOG_COVER_OUTPUT_SIZE = 1000;

/**
 * CMS image upload field. When `squareCrop` is true, opens a 1:1 cropper and
 * exports at `outputSize`×`outputSize` before uploading.
 */
export function CmsImageUploadField({
  label = "Image",
  value,
  onChange,
  hint,
  alt = "",
  previewClassName = "aspect-[21/9] w-full max-w-2xl object-cover",
  emptyClassName = "aspect-[21/9] w-full max-w-2xl",
  squareCrop = false,
  outputSize = BLOG_COVER_OUTPUT_SIZE,
  cropTitle = "Crop image",
  cropSubtitle = "Adjust the square crop, then upload.",
  fileNamePrefix = "cms-image",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropImage, setCropImage] = useState(null);
  const cropObjectUrl = useRef(null);

  useEffect(() => {
    return () => {
      if (cropObjectUrl.current) URL.revokeObjectURL(cropObjectUrl.current);
    };
  }, []);

  function closeCrop() {
    if (cropObjectUrl.current) {
      URL.revokeObjectURL(cropObjectUrl.current);
      cropObjectUrl.current = null;
    }
    setCropImage(null);
  }

  function openCropForFile(file) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    closeCrop();
    cropObjectUrl.current = URL.createObjectURL(file);
    setCropImage({
      src: cropObjectUrl.current,
      fileName: `${fileNamePrefix}-${Date.now()}.jpg`,
    });
  }

  async function uploadFile(file) {
    setUploading(true);
    setError("");
    try {
      const data = await uploadCmsImage(file);
      onChange(data.url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (squareCrop) {
      openCropForFile(file);
      return;
    }

    await uploadFile(file);
  }

  async function handleCropConfirm(file) {
    closeCrop();
    await uploadFile(file);
  }

  const busy = uploading || Boolean(cropImage);

  return (
    <div className="space-y-3">
      {label ? <span className="admin-label">{label}</span> : null}
      {hint ? <p className="text-xs text-emerald-900/45">{hint}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-cream-50">
          <img src={cmsImageSrc(value)} alt={alt || ""} className={previewClassName} />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-xl border border-dashed border-emerald-900/15 bg-cream-50/80 px-4 text-center text-sm text-emerald-900/45 ${emptyClassName}`}
        >
          No image yet — upload one below
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className={`btn-primary cursor-pointer text-xs ${busy ? "opacity-60" : ""}`}>
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
        {value ? (
          <button
            type="button"
            className="btn-ghost text-xs text-red-700"
            onClick={() => onChange("")}
            disabled={busy}
          >
            Remove
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {squareCrop ? (
        <ImageCropModal
          open={Boolean(cropImage)}
          imageSrc={cropImage?.src ?? ""}
          fileName={cropImage?.fileName ?? `${fileNamePrefix}.jpg`}
          title={cropTitle}
          subtitle={cropSubtitle}
          aspect={1}
          outputSize={outputSize}
          onClose={closeCrop}
          onConfirm={handleCropConfirm}
        />
      ) : null}
    </div>
  );
}
