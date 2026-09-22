export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

export const DEFAULT_COUNTRY = "India";

export const PAYMENT_METHODS = [
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Pay securely online using UPI, cards, net banking, or wallets",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
  {
    id: "upi",
    label: "UPI",
    description: "Pay via UPI at order confirmation",
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    description: "Pay by debit or credit card at order confirmation",
  },
];

export function getPaymentMethodLabel(methodId, methods = PAYMENT_METHODS) {
  return methods.find((method) => method.id === methodId)?.label ?? methodId;
}

export function getCheckoutSubmitLabel(paymentMethod, { submitting, emailVerified, razorpayConfigured, testPaymentsAllowed }) {
  if (submitting) {
    return paymentMethod === "razorpay" ? "Processing payment…" : "Placing order…";
  }
  if (!emailVerified) return "Verify email to continue";
  if (!paymentMethod) return "Select a payment method";

  if (paymentMethod === "razorpay") {
    if (razorpayConfigured) return "Pay with Razorpay";
    if (testPaymentsAllowed) return "Pay online (test)";
    return "Payment unavailable";
  }

  if (paymentMethod === "cod") return "Place order (Cash on delivery)";
  if (paymentMethod === "upi") return "Place order (UPI)";
  if (paymentMethod === "card") return "Place order (Card)";
  return "Place order";
}

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 99;

export function getShippingFee(subtotal, settings) {
  const threshold = Number(settings?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD);
  const fee = Number(settings?.shippingFee ?? SHIPPING_FEE);
  return subtotal >= threshold ? 0 : fee;
}

export function getDefaultShippingSettings() {
  return {
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
    promoBarEnabled: true,
    promoBarMessage: "Get FREE shipping on orders above ₹{threshold}",
    promoBarHref: "/products",
  };
}

export function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAL-${stamp}-${rand}`;
}

export const ORDER_STORAGE_KEY = "saliah-last-order";

export function loadLastOrder() {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastOrder(order) {
  sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: DEFAULT_COUNTRY,
  paymentMethod: "razorpay",
};

export function getEmptyCheckoutForm() {
  return { ...emptyForm };
}

export function validateCheckoutForm(form) {
  const errors = {};
  const phoneDigits = String(form.phone ?? "")
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");

  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";

  if (!phoneDigits) errors.phone = "Phone number is required";
  else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state) errors.state = "Select a state";
  if (!form.pincode.trim()) errors.pincode = "PIN code is required";
  else if (!/^\d{6}$/.test(form.pincode)) errors.pincode = "Enter a valid 6-digit PIN code";

  if (!form.paymentMethod) errors.paymentMethod = "Select a payment method";

  return errors;
}

/** Address book only — no payment method required. */
export function validateAddressForm(form) {
  const errors = validateCheckoutForm({ ...form, paymentMethod: "razorpay" });
  delete errors.paymentMethod;
  return errors;
}
