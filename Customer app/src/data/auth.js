import { ORDER_STORAGE_KEY } from "./checkout";
import { getNotificationsStorageKey, NOTIFICATION_DISMISSED_PREFIX, NOTIFICATION_READ_PREFIX } from "./notifications";
import { getOrdersStorageKey } from "./orders";
import { getProfileStorageKey } from "./profile";
import { getWishlistStorageKey } from "./wishlist";

export const USERS_STORAGE_KEY = "saliah-users";
export const SESSION_STORAGE_KEY = "saliah-session";

/** Remove old demo users from localStorage (accounts live in PostgreSQL now). */
export function purgeLegacyLocalUsers() {
  try {
    localStorage.removeItem(USERS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
const CART_STORAGE_KEY = "saliah-cart";

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function createUserId() {
  return `user-${Date.now().toString(36)}`;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  return errors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function validateRegisterField(name, { fullName, email, phone, password, confirmPassword }) {
  switch (name) {
    case "fullName":
      if (!fullName?.trim()) return "Full name is required";
      return undefined;
    case "email":
      if (!email?.trim()) return "Email is required";
      if (!EMAIL_RE.test(email.trim())) return "Enter a valid email";
      return undefined;
    case "phone":
      if (!phone?.trim()) return "Phone number is required";
      if (!PHONE_RE.test(phone.replace(/\s/g, ""))) return "Enter a valid 10-digit mobile number";
      return undefined;
    case "password":
      if (!password) return "Password is required";
      if (password.length < 8) return "Password must be at least 8 characters";
      return undefined;
    case "confirmPassword":
      if (!confirmPassword) return "Please confirm your password";
      if (password !== confirmPassword) return "Passwords do not match";
      return undefined;
    default:
      return undefined;
  }
}

export function validateRegisterForm(form) {
  const errors = {};
  for (const name of ["fullName", "email", "phone", "password", "confirmPassword"]) {
    const message = validateRegisterField(name, form);
    if (message) errors[name] = message;
  }
  return errors;
}

export function findUserByEmail(email) {
  return loadUsers().find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function parseGoogleCredential(credential) {
  const payload = JSON.parse(atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  return {
    fullName: payload.name ?? "Google User",
    email: payload.email,
    phone: "",
    providerId: payload.sub,
  };
}

export function findUserById(id) {
  return loadUsers().find((user) => user.id === id) ?? null;
}

export function updateUserRecord(userId, updates) {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return { ok: false, error: "Account not found" };

  const nextEmail = updates.email?.trim().toLowerCase();
  if (nextEmail) {
    const duplicate = users.find((u) => u.email === nextEmail && u.id !== userId);
    if (duplicate) return { ok: false, error: "Another account uses this email" };
  }

  const updated = {
    ...users[index],
    fullName: updates.fullName?.trim() ?? users[index].fullName,
    email: nextEmail ?? users[index].email,
    phone: updates.phone?.trim() ?? users[index].phone,
  };

  users[index] = updated;
  saveUsers(users);

  const session = {
    id: updated.id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    provider: updated.provider,
  };

  return { ok: true, user: session };
}

export function changeUserPassword(userId, { currentPassword, newPassword }) {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return { ok: false, error: "Account not found" };

  const user = users[index];
  if (user.password) {
    if (!currentPassword) return { ok: false, error: "Current password is required" };
    if (user.password !== currentPassword) return { ok: false, error: "Current password is incorrect" };
  }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters" };
  }

  users[index] = { ...user, password: newPassword };
  saveUsers(users);
  return { ok: true };
}

export function validateProfileForm({ fullName, email, phone }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = "Full name is required";
  if (!email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  if (!phone?.trim()) errors.phone = "Phone is required";
  else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit mobile number";
  return errors;
}

export function validateChangePasswordForm({ currentPassword, newPassword, confirmPassword }, hasPassword) {
  const errors = {};
  if (hasPassword && !currentPassword) errors.currentPassword = "Current password is required";
  if (!newPassword) errors.newPassword = "New password is required";
  else if (newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
  if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export function validateOtpResetPasswordForm({ otp, newPassword, confirmPassword }) {
  const errors = {};
  if (!otp?.trim()) errors.otp = "Verification code is required";
  else if (!/^\d{6}$/.test(otp.trim())) errors.otp = "Enter the 6-digit verification code";
  if (!newPassword) errors.newPassword = "New password is required";
  else if (newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
  else if (!/[A-Za-z]/.test(newPassword)) errors.newPassword = "Password must include at least one letter";
  else if (!/\d/.test(newPassword)) errors.newPassword = "Password must include at least one number";
  if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export function upsertSocialUser({ provider, fullName, email, phone, providerId }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const existing = users.find((user) => user.email === normalizedEmail);

  if (existing) {
    const session = {
      id: existing.id,
      fullName: existing.fullName,
      email: existing.email,
      phone: existing.phone ?? phone ?? "",
      provider: existing.provider ?? provider,
    };
    return { ok: true, user: session };
  }

  const newUser = {
    id: createUserId(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone?.trim() ?? "",
    password: null,
    provider,
    providerId: providerId ?? null,
  };

  saveUsers([...users, newUser]);

  const session = {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    phone: newUser.phone,
    provider,
  };

  return { ok: true, user: session };
}

/** Remove all per-user demo data from browser storage. */
export function purgeUserStoredData(userId) {
  if (!userId) return;

  const keys = [
    getOrdersStorageKey(userId),
    getWishlistStorageKey(userId),
    getProfileStorageKey(userId),
    getNotificationsStorageKey(userId),
    `${NOTIFICATION_READ_PREFIX}-${userId}`,
    `${NOTIFICATION_DISMISSED_PREFIX}-${userId}`,
  ].filter(Boolean);

  keys.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(CART_STORAGE_KEY);

  try {
    sessionStorage.removeItem(ORDER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function deleteUserById(userId) {
  if (!userId) return { ok: false, error: "Not signed in" };

  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return { ok: false, error: "Account not found" };

  users.splice(index, 1);
  saveUsers(users);
  purgeUserStoredData(userId);
  saveSession(null);

  return { ok: true };
}
