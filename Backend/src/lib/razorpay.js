import { prisma } from "./prisma.js";

function readEnvKeyId() {
  return process.env.RAZORPAY_KEY_ID?.trim() ?? "";
}

function readEnvKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
}

const PLACEHOLDER_KEY_IDS = new Set([
  "rzp_test_your_key_id",
  "rzp_live_your_key_id",
  "your_key_id",
]);

const PLACEHOLDER_KEY_SECRETS = new Set([
  "your_key_secret",
  "replace_me",
  "changeme",
]);

function isPlaceholderRazorpayCredential(keyId, keySecret) {
  const normalizedId = String(keyId ?? "").trim().toLowerCase();
  const normalizedSecret = String(keySecret ?? "").trim().toLowerCase();
  if (!normalizedId || !normalizedSecret) return true;
  if (PLACEHOLDER_KEY_IDS.has(normalizedId)) return true;
  if (PLACEHOLDER_KEY_SECRETS.has(normalizedSecret)) return true;
  if (normalizedSecret.includes("your_key") || normalizedId.includes("your_key")) return true;
  return false;
}

/** Resolve secret on admin save: input → database → matching env fallback. */
export function resolveRazorpayKeySecret({ keySecretInput, existingDbSecret, keyId }) {
  const fromInput = String(keySecretInput ?? "").trim();
  if (fromInput) return fromInput;

  const fromDb = String(existingDbSecret ?? "").trim();
  if (fromDb) return fromDb;

  const envKeyId = readEnvKeyId();
  const envKeySecret = readEnvKeySecret();
  if (!envKeySecret) return "";

  const normalizedKeyId = String(keyId ?? "").trim();
  if (!envKeyId || normalizedKeyId === envKeyId) {
    return envKeySecret;
  }

  return "";
}

export async function getRazorpaySettings() {
  const stored = await prisma.storeSetting.findUnique({ where: { key: "razorpay" } });
  const value = stored?.value && typeof stored.value === "object" ? stored.value : {};

  const dbKeyId = String(value.keyId ?? "").trim();
  const dbKeySecret = String(value.keySecret ?? "").trim();
  const envKeyId = readEnvKeyId();
  const envKeySecret = readEnvKeySecret();

  let keyId = dbKeyId || envKeyId;
  let keySecret = dbKeySecret || envKeySecret;
  if (isPlaceholderRazorpayCredential(keyId, keySecret)) {
    keyId = "";
    keySecret = "";
  }
  const configured = Boolean(keyId && keySecret);
  const enabled = value.enabled !== false;
  const active = configured && enabled;

  let source = "none";
  if (dbKeyId || dbKeySecret) source = "database";
  else if (configured) source = "environment";

  return {
    keyId,
    keySecret,
    configured,
    enabled,
    active,
    source,
    keySecretSet: Boolean(dbKeySecret || envKeySecret),
  };
}

export async function isRazorpayConfigured() {
  const settings = await getRazorpaySettings();
  return settings.active;
}

/** Allowed only while live Razorpay keys are missing (disable with ALLOW_TEST_PAYMENTS=false). */
export async function isTestPaymentsAllowed() {
  if (await isRazorpayConfigured()) return false;
  return process.env.ALLOW_TEST_PAYMENTS !== "false";
}

export async function getRazorpayConfig() {
  const settings = await getRazorpaySettings();
  if (!settings.configured) {
    throw new Error("Razorpay is not configured on the server");
  }

  return { keyId: settings.keyId, keySecret: settings.keySecret };
}

export function maskRazorpayKeyId(keyId) {
  const value = String(keyId ?? "").trim();
  if (!value) return "";
  if (value.length <= 8) return value;
  return `${value.slice(0, 8)}${"•".repeat(Math.min(12, value.length - 8))}`;
}
