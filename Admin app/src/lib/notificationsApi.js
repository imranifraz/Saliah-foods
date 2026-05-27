import { apiFetch } from "./api.js";

export function fetchAdminNotificationsApi() {
  return apiFetch("/api/admin/notifications");
}

export function markAdminNotificationsReadApi({ ids, all = false }) {
  return apiFetch("/api/admin/notifications/read", {
    method: "POST",
    body: JSON.stringify(all ? { all: true } : { ids }),
  });
}

export function dismissAdminNotificationsApi({ ids, all = false }) {
  return apiFetch("/api/admin/notifications/dismiss", {
    method: "POST",
    body: JSON.stringify(all ? { all: true } : { ids }),
  });
}
