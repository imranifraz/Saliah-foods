import { apiFetch } from "../lib/api.js";

export async function fetchCmsPage(slug) {
  const data = await apiFetch(`/api/cms/pages/${encodeURIComponent(slug)}`);
  return data.page;
}
