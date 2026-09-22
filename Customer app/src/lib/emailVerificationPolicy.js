/**
 * Email verification gate for checkout.
 * Temporarily hard-disabled so local order testing works.
 * Set ENABLED to true when you want verification enforced again.
 */
const ENABLED = false;

export function isEmailVerificationRequired() {
  if (!ENABLED) return false;
  const value = String(import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION ?? "true").trim().toLowerCase();
  return value !== "false" && value !== "0" && value !== "off";
}
