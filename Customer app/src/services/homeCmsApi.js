import { apiFetch } from "../lib/api.js";

export async function fetchHomeCmsApi() {
  return apiFetch("/api/cms/home");
}
