import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PAYMENT_METHODS } from "../../data/checkout";
import { formatINR, GST_LABEL } from "../../data/pricing";

export function OrderSuccessPopup({ order, onClose }) {
  const reduce = useReducedMotion();
  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ?? order.paymentMethod;
  const { customer } = order;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentPending = customer?.payment?.status === "pending_configuration";
  const testPayment = customer?.payment?.mode === "test";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="order-success-overlay"
        role="presentation"
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <button
          type="button"
          className="order-success-overlay__backdrop"
          aria-label="Close"
          onClick={onClose}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          className="order-success-popup"
          initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="order-success-popup__hero">
            <div className="order-success-popup__icon" aria-hidden>
              <svg className="h-9 w-9 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="order-success-popup__eyebrow">Order placed successfully</p>
            <h2 id="order-success-title" className="order-success-popup__title">
              Thank you for your order
            </h2>
            <p className="order-success-popup__lead">
              Your Saliah order is confirmed. We are preparing it with care.
            </p>
          </div>

          <div className="order-success-popup__summary">
            <div className="order-success-popup__row">
              <span className="order-success-popup__label">Order ID</span>
              <span className="order-success-popup__value">{order.id}</span>
            </div>
            <div className="order-success-popup__row">
              <span className="order-success-popup__label">Items</span>
              <span className="order-success-popup__value">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="order-success-popup__row">
              <span className="order-success-popup__label">Payment</span>
              <span className="order-success-popup__value">{paymentLabel}</span>
            </div>
            <div className="order-success-popup__row order-success-popup__row--total">
              <span className="order-success-popup__label">{paymentPending ? "Total payable" : "Total paid"}</span>
              <span className="order-success-popup__total">{formatINR(order.total)}</span>
            </div>
            {paymentPending ? (
              <p className="order-success-popup__gst">
                Order placed successfully. Payment is pending until Razorpay keys are configured.
              </p>
            ) : testPayment ? (
              <p className="order-success-popup__gst">
                Test payment recorded successfully. {GST_LABEL} included · Confirmation sent to {customer.email}
              </p>
            ) : order.gstAmount != null ? (
              <p className="order-success-popup__gst">
                {GST_LABEL} included · Confirmation sent to {customer.email}
              </p>
            ) : (
              <p className="order-success-popup__gst">Confirmation sent to {customer.email}</p>
            )}
          </div>

          <div className="order-success-popup__actions">
            <Link
              to="/account?tab=orders"
              className="order-success-popup__btn order-success-popup__btn--primary"
              onClick={onClose}
            >
              View my orders
            </Link>
            <Link
              to="/products"
              className="order-success-popup__btn order-success-popup__btn--ghost"
              onClick={onClose}
            >
              Continue shopping
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
