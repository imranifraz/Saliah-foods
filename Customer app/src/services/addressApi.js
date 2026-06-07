import { apiFetch } from "../lib/api.js";

export async function fetchAddressesApi() {
  return apiFetch("/api/addresses");
}

export async function createAddressApi(body) {
  return apiFetch("/api/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAddressApi(id, body) {
  return apiFetch(`/api/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAddressApi(id) {
  return apiFetch(`/api/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function setDefaultAddressApi(id) {
  return apiFetch(`/api/addresses/${id}/default`, {
    method: "PATCH",
  });
}
