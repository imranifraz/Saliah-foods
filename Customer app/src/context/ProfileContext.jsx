import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { loadProfileAddresses } from "../data/profile";
import {
  createAddressApi,
  deleteAddressApi,
  fetchAddressesApi,
  setDefaultAddressApi,
  updateAddressApi,
} from "../services/addressApi.js";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, authReady } = useAuth();
  const userId = user?.id ?? null;
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchAddressesApi();
      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch (err) {
      setAddresses(loadProfileAddresses(userId));
      setError(err.message ?? "Could not load saved addresses");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;
    refreshAddresses();
  }, [authReady, refreshAddresses]);

  const addAddress = useCallback(
    async (address) => {
      if (!userId) throw new Error("Sign in to save addresses");

      try {
        const data = await createAddressApi(address);
        await refreshAddresses();
        return data.address;
      } catch (err) {
        throw new Error(err.message ?? "Could not save address");
      }
    },
    [userId, refreshAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      if (!userId) throw new Error("Sign in to manage addresses");

      try {
        const data = await setDefaultAddressApi(id);
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      } catch (err) {
        throw new Error(err.message ?? "Could not update default address");
      }
    },
    [userId]
  );

  const removeAddress = useCallback(
    async (id) => {
      if (!userId) throw new Error("Sign in to manage addresses");

      try {
        const data = await deleteAddressApi(id);
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      } catch (err) {
        throw new Error(err.message ?? "Could not delete address");
      }
    },
    [userId]
  );

  const updateAddress = useCallback(
    async (id, updates) => {
      if (!userId) throw new Error("Sign in to manage addresses");

      try {
        await updateAddressApi(id, updates);
        await refreshAddresses();
      } catch (err) {
        throw new Error(err.message ?? "Could not update address");
      }
    },
    [userId, refreshAddresses]
  );

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );

  const value = useMemo(
    () => ({
      addresses,
      defaultAddress,
      loading,
      error,
      refreshAddresses,
      addAddress,
      setDefaultAddress,
      removeAddress,
      updateAddress,
    }),
    [
      addresses,
      defaultAddress,
      loading,
      error,
      refreshAddresses,
      addAddress,
      setDefaultAddress,
      removeAddress,
      updateAddress,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
