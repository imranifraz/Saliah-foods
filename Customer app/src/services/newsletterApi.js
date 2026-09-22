import { apiFetch } from "../lib/api";

export function subscribeNewsletterApi({ email, source = "website" }) {
  return apiFetch("/api/newsletter", {
    method: "POST",
    body: JSON.stringify({ email, source }),
  });
}
