import { apiFetch } from "../lib/api.js";

export async function fetchWishlistApi() {
  return apiFetch("/api/wishlist");
}

export async function addWishlistItemApi(body) {
  return apiFetch("/api/wishlist", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function removeWishlistItemApi({ variantId, slug, packSize = "" }) {
  if (variantId) {
    return apiFetch(`/api/wishlist/${encodeURIComponent(variantId)}`, {
      method: "DELETE",
    });
  }

  const params = new URLSearchParams({
    slug: String(slug ?? ""),
    packSize: String(packSize ?? ""),
  });
  return apiFetch(`/api/wishlist/_?${params.toString()}`, {
    method: "DELETE",
  });
}
