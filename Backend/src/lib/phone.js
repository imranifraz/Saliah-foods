export const INDIAN_MOBILE_LOCAL_RE = /^[6-9]\d{9}$/;

export function phoneLocalDigits(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) return digits.slice(2);
  return digits;
}

export function validateIndianPhone(phone) {
  if (phone == null || String(phone).trim() === "") {
    return { ok: true, normalized: "" };
  }

  const local = phoneLocalDigits(phone);
  if (!INDIAN_MOBILE_LOCAL_RE.test(local)) {
    return { ok: false, error: "Enter a valid 10-digit mobile number" };
  }

  return { ok: true, normalized: `+91${local}` };
}
