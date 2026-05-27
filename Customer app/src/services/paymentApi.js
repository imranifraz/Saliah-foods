import { apiFetch } from "../lib/api.js";

let razorpayScriptPromise = null;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error("Razorpay failed to load"));
      };
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export async function createRazorpayOrderApi(body) {
  return apiFetch("/api/payments/razorpay/order", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verifyRazorpayPaymentApi(body) {
  return apiFetch("/api/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchPaymentMethodsApi() {
  return apiFetch("/api/payments/methods");
}

export async function verifyTestPaymentApi(body) {
  return apiFetch("/api/payments/test/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
