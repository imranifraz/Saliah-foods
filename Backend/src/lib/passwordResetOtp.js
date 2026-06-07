import crypto from "crypto";

const OTP_PURPOSE = "admin_password_reset";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function otpPepper() {
  return process.env.JWT_SECRET ?? "saliah-dev-pepper";
}

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtpCode(code, email) {
  return crypto.createHash("sha256").update(`${code}:${email.toLowerCase()}:${otpPepper()}`).digest("hex");
}

export function otpExpiresAt() {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function canResendOtp(lastCreatedAt) {
  if (!lastCreatedAt) return true;
  return Date.now() - new Date(lastCreatedAt).getTime() >= OTP_RESEND_MS;
}

export function resendCooldownSeconds(lastCreatedAt) {
  if (!lastCreatedAt) return 0;
  const remaining = OTP_RESEND_MS - (Date.now() - new Date(lastCreatedAt).getTime());
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export const passwordResetOtpConfig = {
  OTP_PURPOSE,
  OTP_TTL_MS,
  OTP_RESEND_MS,
  MAX_ATTEMPTS,
};
