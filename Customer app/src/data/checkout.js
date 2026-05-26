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

export const PAYMENT_METHODS = [
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Pay securely online using UPI, cards, net banking, or wallets",
  },
];

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 99;

export function getShippingFee(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
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
  paymentMethod: "razorpay",
};

export function getEmptyCheckoutForm() {
  return { ...emptyForm };
}

export function validateCheckoutForm(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";

  if (!form.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
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
