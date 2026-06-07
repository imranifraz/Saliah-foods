import { apiFetch } from "../lib/api.js";

export async function requestPasswordResetOtpApi(email) {
  return apiFetch("/api/auth/forgot-password/request-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function verifyPasswordResetOtpApi({ email, otp, newPassword }) {
  return apiFetch("/api/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp, newPassword }),
  });
}
