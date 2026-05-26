import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createWishlistEntry,
  loadWishlist,
  saveWishlist,
  wishlistItemKey,
} from "../data/wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(userId ? loadWishlist(userId) : []);
  }, [userId]);

  useEffect(() => {
    if (userId) saveWishlist(userId, items);
  }, [userId, items]);

  const isInWishlist = useCallback(
    (product) => {
      const key = wishlistItemKey({
        variantId: product.variantId ?? null,
        slug: product.slug,
        packSize: product.packSize ?? "",
      });
      return items.some((item) => wishlistItemKey(item) === key);
    },
    [items]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!isAuthenticated) return { ok: false, needsAuth: true };
      const key = wishlistItemKey({
        variantId: product.variantId ?? null,
        slug: product.slug,
        packSize: product.packSize ?? "",
      });
      const exists = items.some((item) => wishlistItemKey(item) === key);

      if (exists) {
        setItems((prev) => prev.filter((item) => wishlistItemKey(item) !== key));
        return { ok: true, added: false };
      }

      setItems((prev) => [...prev, createWishlistEntry(product)]);
      return { ok: true, added: true };
    },
    [items, isAuthenticated]
  );

  const removeFromWishlist = useCallback((variantId, slug, packSize = "") => {
    const key = wishlistItemKey({ variantId, slug, packSize });
    setItems((prev) => prev.filter((item) => wishlistItemKey(item) !== key));
  }, []);

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [items, count, isInWishlist, toggleWishlist, removeFromWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
