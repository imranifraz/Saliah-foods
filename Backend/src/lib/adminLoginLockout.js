const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

/** @type {Map<string, { failures: number; lockedUntil: number | null; windowStart: number }>} */
const attempts = new Map();

function getKey(email) {
  return email.trim().toLowerCase();
}

function getRecord(email) {
  const key = getKey(email);
  const now = Date.now();
  let record = attempts.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { failures: 0, lockedUntil: null, windowStart: now };
    attempts.set(key, record);
  }

  return record;
}

export function getAdminLoginLockout(email) {
  const record = getRecord(email);
  const now = Date.now();

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (record.lockedUntil && record.lockedUntil <= now) {
    record.failures = 0;
    record.lockedUntil = null;
    record.windowStart = now;
  }

  return { locked: false, retryAfterSeconds: 0 };
}

export function recordAdminLoginFailure(email) {
  const record = getRecord(email);
  record.failures += 1;

  if (record.failures >= LOCKOUT_THRESHOLD) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }

  return getAdminLoginLockout(email);
}

export function clearAdminLoginFailures(email) {
  attempts.delete(getKey(email));
}

export const adminLoginLockoutConfig = {
  LOCKOUT_THRESHOLD,
  LOCKOUT_MS,
};
