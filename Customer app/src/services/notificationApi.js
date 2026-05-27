import { apiFetch } from "../lib/api.js";

export function fetchNotificationsApi() {
  return apiFetch("/api/notifications");
}

export function fetchNotificationPrefsApi() {
  return apiFetch("/api/notifications/prefs");
}

export function updateNotificationPrefsApi(prefs) {
  return apiFetch("/api/notifications/prefs", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

export function markNotificationsReadApi({ ids, all = false }) {
  return apiFetch("/api/notifications/read", {
    method: "POST",
    body: JSON.stringify(all ? { all: true } : { ids }),
  });
}

export function dismissNotificationsApi({ ids, all = false }) {
  return apiFetch("/api/notifications/dismiss", {
    method: "POST",
    body: JSON.stringify(all ? { all: true } : { ids }),
  });
}
