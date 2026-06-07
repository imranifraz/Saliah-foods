import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./notificationsCtx.js";
import { isActiveOrder } from "../data/orders";
import { cancelOrderApi, fetchOrdersApi } from "../services/orderApi.js";
import { fetchMyReviewItemsApi, submitReviewApi } from "../services/reviewApi.js";

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
  const userId = user?.id ?? null;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchOrdersApi();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const refreshReviewItems = useCallback(async () => {
    if (!userId) {
      setReviewItems([]);
      return;
    }

    setReviewLoading(true);
    try {
      const data = await fetchMyReviewItemsApi();
      setReviewItems(data.items ?? []);
    } catch {
      setReviewItems([]);
    } finally {
      setReviewLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshReviewItems();
  }, [refreshReviewItems]);

  const addOrder = useCallback(
    (order) => {
      setOrders((prev) => [order, ...prev.filter((entry) => entry.id !== order.id)]);
      refreshNotifications();
      return order;
    },
    [refreshNotifications]
  );

  const cancelOrder = useCallback(
    async (orderId, reason = "") => {
      if (!userId) return { ok: false, error: "Not signed in" };

      try {
        const data = await cancelOrderApi(orderId, reason);
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? data.order : order))
        );
        refreshNotifications();
        return { ok: true, order: data.order };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [userId, refreshNotifications]
  );

  const submitReview = useCallback(
    async ({ orderItemId, rating, title, comment }) => {
      if (!userId) return { ok: false, error: "Not signed in" };

      try {
        const data = await submitReviewApi({ orderItemId, rating, title, comment });
        setReviewItems((prev) => {
          const index = prev.findIndex((entry) => entry.item.id === orderItemId);
          if (index === -1) return prev;

          const next = [...prev];
          next[index] = {
            ...next[index],
            item: {
              ...next[index].item,
              review: data.review,
            },
          };
          return next;
        });
        setOrders((prev) =>
          prev.map((order) => ({
            ...order,
            items: order.items.map((item) =>
              item.id === orderItemId ? { ...item, review: data.review } : item
            ),
          }))
        );
        return { ok: true, review: data.review };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [userId]
  );

  const currentOrders = useMemo(() => orders.filter(isActiveOrder), [orders]);
  const pastOrders = useMemo(
    () => orders.filter((o) => !isActiveOrder(o)),
    [orders]
  );
  const reviewItemsByOrderItemId = useMemo(
    () => Object.fromEntries(reviewItems.map((entry) => [entry.item.id, entry])),
    [reviewItems]
  );

  const getOrderById = useCallback((id) => orders.find((o) => o.id === id) ?? null, [orders]);

  const value = useMemo(
    () => ({
      orders,
      currentOrders,
      pastOrders,
      loading,
      reviewItems,
      reviewItemsByOrderItemId,
      reviewLoading,
      addOrder,
      cancelOrder,
      submitReview,
      getOrderById,
      refreshOrders,
      refreshReviewItems,
    }),
    [
      orders,
      currentOrders,
      pastOrders,
      loading,
      reviewItems,
      reviewItemsByOrderItemId,
      reviewLoading,
      addOrder,
      cancelOrder,
      submitReview,
      getOrderById,
      refreshOrders,
      refreshReviewItems,
    ]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used within OrdersProvider");
  return context;
}
