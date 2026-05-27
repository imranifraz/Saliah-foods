import { apiFetch } from "../lib/api.js";

export function fetchProductReviewsApi(slug) {
  return apiFetch(`/api/products/slug/${encodeURIComponent(slug)}/reviews`);
}
