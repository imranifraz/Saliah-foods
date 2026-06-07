export const INDIAN_MOBILE_LOCAL_RE = /^[6-9]\d{9}$/;

export function phoneLocalDigits(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) return digits.slice(2);
  return digits;
}

export function formatPhoneForStorage(localDigits) {
  const digits = (localDigits ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `+91${digits}`;
}

export function formatPhoneDisplay(phone) {
  if (!phone?.trim()) return "—";
  if (phone.startsWith("+91")) return phone;
  const digits = phone.replace(/\D/g, "");
  return digits ? `+91 ${digits}` : "—";
}

export function validateIndianPhoneLocal(localDigits) {
  const digits = (localDigits ?? "").replace(/\D/g, "");
  if (!digits) return { ok: true };
  if (!INDIAN_MOBILE_LOCAL_RE.test(digits)) {
    return { ok: false, error: "Enter a valid 10-digit mobile number" };
  }
  return { ok: true };
}
