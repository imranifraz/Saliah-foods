import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createAddressId,
  loadProfileAddresses,
  saveProfileAddresses,
} from "../data/profile";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [addresses, setAddresses] = useState([]);

  const persistAddresses = useCallback(
    (next) => {
      if (userId) saveProfileAddresses(userId, next);
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      setAddresses(loadProfileAddresses(userId));
    } else {
      setAddresses([]);
    }
  }, [userId]);

  const addAddress = useCallback(
    (address) => {
      const entry = {
        ...address,
        id: createAddressId(),
        isDefault: false,
      };

      setAddresses((prev) => {
        const next = [...prev, entry];
        if (next.length === 1) {
          next[0] = { ...next[0], isDefault: true };
        }
        persistAddresses(next);
        return next;
      });

      return entry;
    },
    [persistAddresses]
  );

  const setDefaultAddress = useCallback(
    (id) => {
      setAddresses((prev) => {
        const next = prev.map((address) => ({
          ...address,
          isDefault: address.id === id,
        }));
        persistAddresses(next);
        return next;
      });
    },
    [persistAddresses]
  );

  const removeAddress = useCallback(
    (id) => {
      setAddresses((prev) => {
        const next = prev.filter((address) => address.id !== id);
        if (next.length && !next.some((address) => address.isDefault)) {
          next[0] = { ...next[0], isDefault: true };
        }
        persistAddresses(next);
        return next;
      });
    },
    [persistAddresses]
  );

  const updateAddress = useCallback(
    (id, updates) => {
      setAddresses((prev) => {
        const next = prev.map((address) =>
          address.id === id ? { ...address, ...updates } : address
        );
        persistAddresses(next);
        return next;
      });
    },
    [persistAddresses]
  );

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );

  const value = useMemo(
    () => ({
      addresses,
      defaultAddress,
      addAddress,
      setDefaultAddress,
      removeAddress,
      updateAddress,
    }),
    [addresses, defaultAddress, addAddress, setDefaultAddress, removeAddress, updateAddress]
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
