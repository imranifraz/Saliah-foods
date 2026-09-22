import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadSession, purgeLegacyLocalUsers, saveSession } from "../data/auth";
import { getAuthToken } from "../lib/api.js";
import {
  registerAccount,
  loginAccount,
  socialLogin,
  fetchMe,
  updateProfileApi,
  changePasswordApi,
  deleteAccountApi,
  clearAuthToken,
  verifyEmailApi,
  resendVerificationEmailApi,
} from "../services/authApi.js";
import { isEmailVerificationRequired } from "../lib/emailVerificationPolicy.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getAuthToken() ? loadSession() : null));
  const [hasPassword, setHasPassword] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (user) {
      saveSession(user);
    } else if (authReady && !getAuthToken()) {
      saveSession(null);
    }
  }, [user, authReady]);

  useEffect(() => {
    purgeLegacyLocalUsers();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getAuthToken()) {
        if (!cancelled) {
          setUser(null);
          setAuthReady(true);
        }
        return;
      }

      try {
        const data = await fetchMe();
        if (!cancelled) {
          setUser(data.user);
          setHasPassword(data.hasPassword);
        }
      } catch (err) {
        if (!cancelled && err.status === 401) {
          clearAuthToken();
          setUser(null);
          setHasPassword(false);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = useCallback((data) => {
    setUser(data.user);
    setHasPassword(Boolean(data.hasPassword));
    return {
      ok: true,
      user: data.user,
      message: data.message,
      verificationEmailSent: data.verificationEmailSent,
      emailVerified: Boolean(data.user?.emailVerified ?? data.emailVerified),
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const data = await loginAccount({ email, password });
      return applyAuth(data);
    } catch (err) {
      if (err.errors) return { ok: false, errors: err.errors };
      return { ok: false, error: err.message };
    }
  }, [applyAuth]);

  const register = useCallback(async (form) => {
    try {
      const data = await registerAccount({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      return applyAuth(data);
    } catch (err) {
      if (err.errors) return { ok: false, errors: err.errors };
      return { ok: false, error: err.message };
    }
  }, [applyAuth]);

  const loginWithSocial = useCallback(async ({ provider, fullName, email, phone, providerId }) => {
    if (!email?.trim()) {
      return { ok: false, error: "Email permission is required to sign in." };
    }
    try {
      const data = await socialLogin({ provider, fullName, email, phone, providerId });
      return applyAuth(data);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [applyAuth]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setHasPassword(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user?.id) return { ok: false, error: "Not signed in" };
    try {
      await deleteAccountApi();
      clearAuthToken();
      setUser(null);
      setHasPassword(false);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [user?.id]);

  const updateProfile = useCallback(
    async (fields) => {
      if (!user?.id) return { ok: false, error: "Not signed in" };
      try {
        const data = await updateProfileApi(fields);
        setUser(data.user);
        return { ok: true, user: data.user };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [user?.id]
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      if (!user?.id) return { ok: false, error: "Not signed in" };
      try {
        await changePasswordApi({ currentPassword, newPassword });
        setHasPassword(true);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [user?.id]
  );

  const markPasswordUpdated = useCallback(() => {
    setHasPassword(true);
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      const data = await verifyEmailApi(token);
      setUser(data.user);
      return {
        ok: true,
        message: data.message,
        alreadyVerified: Boolean(data.alreadyVerified),
      };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!user?.id) return { ok: false, error: "Sign in to resend verification email" };
    try {
      const data = await resendVerificationEmailApi();
      return { ok: true, message: data.message ?? "Verification email sent." };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [user?.id]);

  // In dev, allow bypass via VITE_REQUIRE_EMAIL_VERIFICATION=false in .env
  // IMPORTANT: This env is baked at build time — restart Vite after changing it.
  const emailVerified = !isEmailVerificationRequired() || Boolean(user?.emailVerified);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user) || (!authReady && Boolean(getAuthToken())),
      emailVerified,
      hasPassword,
      authReady,
      login,
      register,
      loginWithSocial,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      markPasswordUpdated,
      verifyEmail,
      resendVerificationEmail,
    }),
    [
      user,
      emailVerified,
      hasPassword,
      authReady,
      login,
      register,
      loginWithSocial,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      markPasswordUpdated,
      verifyEmail,
      resendVerificationEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
