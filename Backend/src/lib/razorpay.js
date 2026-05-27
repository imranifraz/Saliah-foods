export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

/** Allowed only while live Razorpay keys are missing (disable with ALLOW_TEST_PAYMENTS=false). */
export function isTestPaymentsAllowed() {
  if (isRazorpayConfigured()) return false;
  return process.env.ALLOW_TEST_PAYMENTS !== "false";
}

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured on the server");
  }

  return { keyId, keySecret };
}
