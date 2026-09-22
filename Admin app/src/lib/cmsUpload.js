import { apiFetch } from "./api.js";
import { resolveAdminMediaUrl } from "./mediaUrl.js";

export async function uploadCmsImage(file) {
  const formData = new FormData();
  // Backend accepts either field name; "file" covers image + video.
  formData.append("file", file);
  formData.append("image", file);
  return apiFetch("/api/admin/cms/upload", {
    method: "POST",
    body: formData,
  });
}

export async function uploadCmsImages(files) {
  const results = [];
  for (const file of files) {
    const data = await uploadCmsImage(file);
    results.push({
      url: data.url,
      type: data.mediaType || data.kind || (file.type?.startsWith("video/") ? "video" : "image"),
    });
  }
  return results;
}

/** @deprecated Use resolveAdminMediaUrl — kept for existing imports */
export function cmsImageSrc(url) {
  return resolveAdminMediaUrl(url);
}

export { resolveAdminMediaUrl, resolveAdminMediaFallback, pickProductCoverImage } from "./mediaUrl.js";
