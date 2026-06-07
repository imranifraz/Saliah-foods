import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { createWishlistEntry, loadWishlist, wishlistItemKey } from "../data/wishlist";
import {
  addWishlistItemApi,
  fetchWishlistApi,
  removeWishlistItemApi,
} from "../services/wishlistApi.js";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, isAuthenticated, authReady } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshWishlist = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchWishlistApi();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setItems(loadWishlist(userId));
      setError(err.message ?? "Could not load wishlist");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;
    refreshWishlist();
  }, [authReady, refreshWishlist]);

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
    async (product) => {
      if (!isAuthenticated) return { ok: false, needsAuth: true };

      const key = wishlistItemKey({
        variantId: product.variantId ?? null,
        slug: product.slug,
        packSize: product.packSize ?? "",
      });
      const exists = items.some((item) => wishlistItemKey(item) === key);
      const previousItems = items;

      if (exists) {
        setItems((prev) => prev.filter((item) => wishlistItemKey(item) !== key));
        try {
          await removeWishlistItemApi({
            variantId: product.variantId ?? null,
            slug: product.slug,
            packSize: product.packSize ?? "",
          });
          return { ok: true, added: false };
        } catch (err) {
          setItems(previousItems);
          return { ok: false, error: err.message ?? "Could not update wishlist" };
        }
      }

      const entry = createWishlistEntry(product);
      setItems((prev) => [...prev, entry]);
      try {
        const data = await addWishlistItemApi(entry);
        setItems((prev) =>
          prev.map((item) => (wishlistItemKey(item) === key ? data.item : item))
        );
        return { ok: true, added: true };
      } catch (err) {
        setItems(previousItems);
        return { ok: false, error: err.message ?? "Could not update wishlist" };
      }
    },
    [items, isAuthenticated]
  );

  const removeFromWishlist = useCallback(
    async (variantId, slug, packSize = "") => {
      const key = wishlistItemKey({ variantId, slug, packSize });
      const previousItems = items;
      setItems((prev) => prev.filter((item) => wishlistItemKey(item) !== key));

      try {
        await removeWishlistItemApi({ variantId, slug, packSize });
      } catch (err) {
        setItems(previousItems);
        throw new Error(err.message ?? "Could not remove wishlist item");
      }
    },
    [items]
  );

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      loading,
      error,
      refreshWishlist,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [items, count, loading, error, refreshWishlist, isInWishlist, toggleWishlist, removeFromWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
