export const PROFILE_STORAGE_PREFIX = "saliah-profile-addresses";

export function getProfileStorageKey(userId) {
  return userId ? `${PROFILE_STORAGE_PREFIX}-${userId}` : null;
}

export function loadProfileAddresses(userId) {
  const key = getProfileStorageKey(userId);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through
  }

  return [];
}

export function saveProfileAddresses(userId, addresses) {
  const key = getProfileStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(addresses));
}

export function formatAddressSummary(address) {
  const line2 = address.addressLine2 ? `, ${address.addressLine2}` : "";
  const country = address.country?.trim() || "India";
  return `${address.addressLine1}${line2}, ${address.city}, ${address.state} ${address.pincode}, ${country}`;
}

export function addressToCheckoutCustomer(address, paymentMethod) {
  return {
    fullName: address.fullName,
    email: address.email,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country ?? "India",
    paymentMethod,
    savedAddressId: address.id,
    addressLabel: address.label,
  };
}

export function createAddressId() {
  return `addr-${Date.now().toString(36)}`;
}

export function buildAddressFromUser(user) {
  return {
    label: "Home",
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: true,
  };
}
