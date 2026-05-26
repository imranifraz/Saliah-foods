import { apiFetch } from "../lib/api.js";

export async function fetchMyReviewItemsApi() {
  return apiFetch("/api/reviews/mine");
}

export async function submitReviewApi(body) {
  return apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
