const MIN_LENGTH = 8;
const HAS_LETTER = /[A-Za-z]/;
const HAS_NUMBER = /\d/;

export function validatePasswordStrength(password) {
  const value = String(password ?? "");

  if (value.length < MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (!HAS_LETTER.test(value)) {
    return { ok: false, error: "Password must include at least one letter" };
  }
  if (!HAS_NUMBER.test(value)) {
    return { ok: false, error: "Password must include at least one number" };
  }

  return { ok: true };
}

export const passwordPolicy = {
  MIN_LENGTH,
};
