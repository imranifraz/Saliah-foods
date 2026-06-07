import { apiFetch, setAuthToken } from "../lib/api.js";
import { purgeLegacyLocalUsers } from "../data/auth.js";

function persistAuth(data) {
  setAuthToken(data.token);
  purgeLegacyLocalUsers();
  return data;
}

export async function checkApiHealth() {
  return apiFetch("/api/health");
}

export async function registerAccount(body) {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return persistAuth(data);
}

export async function loginAccount(body) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return persistAuth(data);
}

export async function socialLogin(body) {
  const data = await apiFetch("/api/auth/social", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return persistAuth(data);
}

export async function fetchMe() {
  return apiFetch("/api/auth/me");
}

export async function updateProfileApi(body) {
  return apiFetch("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function uploadProfileAvatarApi(file) {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch("/api/auth/upload-avatar", {
    method: "POST",
    body: formData,
  });
}

export async function changePasswordApi(body) {
  return apiFetch("/api/auth/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAccountApi() {
  return apiFetch("/api/auth/account", { method: "DELETE" });
}

export async function verifyEmailApi(token) {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerificationEmailApi() {
  return apiFetch("/api/auth/resend-verification", { method: "POST" });
}

export function clearAuthToken() {
  setAuthToken(null);
}
