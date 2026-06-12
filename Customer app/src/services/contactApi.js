import { apiFetch } from "../lib/api.js";

export async function submitContactMessage(payload) {
  return apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
