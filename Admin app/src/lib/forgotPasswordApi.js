import { apiFetch } from "./api.js";

export async function requestAdminPasswordResetOtp(email) {
  return apiFetch("/api/admin/auth/forgot-password/request-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function verifyAdminPasswordResetOtp({ email, otp, newPassword }) {
  return apiFetch("/api/admin/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: String(otp).trim(),
      newPassword,
    }),
  });
}
