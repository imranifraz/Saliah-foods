import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CartDrawer } from "../components/cart/CartDrawer";
import { generateOrderId, getShippingFee, saveLastOrder } from "../data/checkout";
import { useGstSettings } from "./GstSettingsContext.jsx";
import { trackAddToCart } from "../lib/analytics.js";

const STORAGE_KEY = "saliah-cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function itemKey(item) {
  return item.variantId ? `variant:${item.variantId}` : `${item.slug}::${item.packSize ?? ""}`;
}

const CartContext = createContext(null);

function CartToast({ message }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-cream-200/80 bg-white/95 px-5 py-3 font-body text-[13px] text-emerald-900 shadow-[0_8px_32px_rgba(22,49,42,0.12)] backdrop-blur-sm"
    >
      {message}
    </motion.div>
  );
}

export function CartProvider({ children }) {
  const { calcOrderBreakdown } = useGstSettings();
  const [items, setItems] = useState(loadCart);
  const [toast, setToast] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((open) => !open), []);

  const addItem = useCallback((item) => {
    const key = itemKey(item);

    setItems((prev) => {
      const index = prev.findIndex((entry) => itemKey(entry) === key);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + 1 };
        return next;
      }
      return [...prev, { ...item, id: key, quantity: 1 }];
    });

    setToast({ message: `${item.name} added to cart` });
    trackAddToCart(item);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.priceValue ?? 0) * item.quantity, 0),
    [items]
  );

  const placeOrder = useCallback(
    (customer) => {
      const orderSubtotal = items.reduce((sum, item) => sum + (item.priceValue ?? 0) * item.quantity, 0);
      const shipping = getShippingFee(orderSubtotal);
      const pricing = calcOrderBreakdown(orderSubtotal, shipping);
      const order = {
        id: generateOrderId(),
        items: items.map((item) => ({ ...item })),
        subtotal: orderSubtotal,
        shipping,
        total: pricing.total,
        gstAmount: pricing.gstAmount,
        gstLabel: pricing.gstLabel,
        paymentMethod: customer.paymentMethod,
        customer,
        createdAt: new Date().toISOString(),
      };

      saveLastOrder(order);
      setItems([]);
      setIsOpen(false);
      return order;
    },
    [items, calcOrderBreakdown]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      placeOrder,
      totalCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      placeOrder,
      totalCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <AnimatePresence>{toast ? <CartToast message={toast.message} /> : null}</AnimatePresence>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
