import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageMeta } from "../components/pages/PageMeta";
import { OrderSuccessPopup } from "../components/checkout/OrderSuccessPopup";
import { loadLastOrder, saveLastOrder } from "../data/checkout";

/** Fallback route — shows the same thank-you popup as checkout. */
export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order] = useState(() => location.state?.order ?? loadLastOrder());

  useEffect(() => {
    if (order) saveLastOrder(order);
  }, [order]);

  if (!order) {
    return <Navigate to="/products/all" replace />;
  }

  return (
    <>
      <PageMeta title="Order confirmed" description="Your Saliah Foods order has been placed successfully." />
      <OrderSuccessPopup
        order={order}
        onClose={() => navigate("/products/all", { replace: true })}
      />
    </>
  );
}
