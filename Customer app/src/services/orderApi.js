import { apiFetch } from "../lib/api.js";

export async function fetchOrdersApi() {
  return apiFetch("/api/orders");
}

export async function createOrderApi(body) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cancelOrderApi(orderId, reason = "") {
  return apiFetch(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
