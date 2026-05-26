import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { CheckoutAddressSection } from "../components/checkout/CheckoutAddressSection";
import { CheckoutOrderSummary } from "../components/checkout/CheckoutOrderSummary";
import { OrderSuccessPopup } from "../components/checkout/OrderSuccessPopup";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useProfile } from "../context/ProfileContext";
import { addressToCheckoutCustomer } from "../data/profile";
import {
  getEmptyCheckoutForm,
  getShippingFee,
  validateCheckoutForm,
} from "../data/checkout";
import { calcOrderBreakdown } from "../data/pricing";
import { createOrderApi } from "../services/orderApi.js";
import {
  createRazorpayOrderApi,
  fetchPaymentMethodsApi,
  loadRazorpayCheckout,
  verifyRazorpayPaymentApi,
} from "../services/paymentApi.js";

export function CheckoutPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const { items, subtotal, clearCart, closeCart } = useCart();
  const { addOrder } = useOrders();
  const { addresses, defaultAddress, addAddress } = useProfile();

  const [addressMode, setAddressMode] = useState("new");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newForm, setNewForm] = useState({ ...getEmptyCheckoutForm(), addressLabel: "" });
  const [saveNewToProfile, setSaveNewToProfile] = useState(true);
  const paymentMethod = "razorpay";
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [razorpayConfigured, setRazorpayConfigured] = useState(true);

  useEffect(() => {
    if (addresses.length > 0) {
      setAddressMode("saved");
      setSelectedAddressId(defaultAddress?.id ?? addresses[0]?.id ?? null);
      return;
    }

    setAddressMode("new");
    setSelectedAddressId(null);
    if (user) {
      setNewForm((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      }));
    }
  }, [addresses, defaultAddress, user]);

  useEffect(() => {
    fetchPaymentMethodsApi()
      .then((data) => setRazorpayConfigured(data.razorpayConfigured !== false))
      .catch(() => {});
  }, []);

  if (items.length === 0 && !completedOrder) {
    return <Navigate to="/products/all" replace />;
  }

  if (!user && !completedOrder) {
    return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  }

  const updateNewField = (name, value) => {
    setNewForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (addressMode === "saved") {
      if (!selectedAddressId) {
        nextErrors.selectedAddressId = "Please select a delivery address";
      }
    } else {
      Object.assign(nextErrors, validateCheckoutForm({ ...newForm, paymentMethod }));
      if (!newForm.addressLabel?.trim()) nextErrors.addressLabel = "Address label is required";
    }

    if (!paymentMethod) nextErrors.paymentMethod = "Select a payment method";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    let customer;

    if (addressMode === "saved") {
      const selected = addresses.find((address) => address.id === selectedAddressId);
      if (!selected) {
        setErrors({ selectedAddressId: "Please select a delivery address" });
        return;
      }
      customer = addressToCheckoutCustomer(selected, paymentMethod);
    } else {
      customer = {
        fullName: newForm.fullName.trim(),
        email: newForm.email.trim(),
        phone: newForm.phone.trim(),
        addressLine1: newForm.addressLine1.trim(),
        addressLine2: newForm.addressLine2.trim(),
        city: newForm.city.trim(),
        state: newForm.state,
        pincode: newForm.pincode.trim(),
        paymentMethod,
        addressLabel: newForm.addressLabel.trim(),
      };

      if (saveNewToProfile) {
        addAddress({
          label: newForm.addressLabel.trim(),
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode,
        });
      }
    }

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const shipping = getShippingFee(subtotal);
      const pricing = calcOrderBreakdown(subtotal, shipping);
      let paymentVerificationToken = null;

      if (razorpayConfigured) {
        await loadRazorpayCheckout();
        const razorpayData = await createRazorpayOrderApi({
          amount: pricing.total,
        });

        const paymentResponse = await new Promise((resolve, reject) => {
          const razorpay = new window.Razorpay({
            key: razorpayData.keyId,
            order_id: razorpayData.order.id,
            amount: razorpayData.order.amount,
            currency: razorpayData.order.currency,
            name: "Saliah Foods",
            description: `Payment for ${items.length} item${items.length !== 1 ? "s" : ""}`,
            prefill: {
              name: customer.fullName,
              email: customer.email,
              contact: customer.phone,
            },
            notes: {
              addressLabel: customer.addressLabel ?? "",
            },
            theme: {
              color: "#16312a",
            },
            modal: {
              ondismiss: () => reject(new Error("Payment was cancelled")),
            },
            handler: (response) => resolve(response),
          });

          razorpay.on("payment.failed", (event) => {
            reject(new Error(event.error?.description ?? "Online payment failed"));
          });

          razorpay.open();
        });

        const paymentVerification = await verifyRazorpayPaymentApi(paymentResponse);
        paymentVerificationToken = paymentVerification.verificationToken;
      }

      const data = await createOrderApi({
        items,
        customer,
        subtotal,
        shipping,
        total: pricing.total,
        gstAmount: pricing.gstAmount,
        gstLabel: pricing.gstLabel,
        paymentMethod,
        paymentVerificationToken,
      });

      closeCart();
      clearCart();
      addOrder(data.order);
      setCompletedOrder(data.order);
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <>
        <PageMeta title="Order confirmed" description="Your Saliah Foods order has been placed successfully." />
        <OrderSuccessPopup
          order={completedOrder}
          onClose={() => navigate("/products/all", { replace: true })}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Checkout" description="Complete your Saliah Foods order with secure delivery across India." />

      <div className="relative pb-20 pt-[calc(var(--site-header)+1rem)] md:pb-24 md:pt-[calc(var(--site-header)+1.25rem)]">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="plp-texture pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5 md:px-10">
          <nav className="font-body text-[11px] uppercase tracking-[0.16em] text-emerald-900/35" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-emerald-800">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-900/60">Checkout</span>
          </nav>

          <motion.header
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium text-emerald-900">Checkout</h1>
            <p className="mt-2 font-body text-sm text-emerald-900/45">
              {razorpayConfigured
                ? "Select a saved address or add a new one, then complete your online payment."
                : "Select a saved address or add a new one. Payment is temporarily marked pending until Razorpay is configured."}
            </p>
          </motion.header>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
            <div className="space-y-6">
              <CheckoutAddressSection
                savedAddresses={addresses}
                addressMode={addressMode}
                onAddressModeChange={setAddressMode}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                newForm={newForm}
                onNewFieldChange={updateNewField}
                saveNewToProfile={saveNewToProfile}
                onSaveNewToProfileChange={setSaveNewToProfile}
                errors={errors}
              />

              <section className="rounded-2xl border border-cream-200/80 bg-white/90 p-5 md:p-6">
                <h2 className="font-display text-lg text-emerald-900">Online payment</h2>
                <div className="mt-4 rounded-xl border border-emerald-900/15 bg-emerald-900/[0.03] px-4 py-4">
                  <p className="font-body text-sm font-medium text-emerald-900">Razorpay</p>
                  <p className="mt-1 font-body text-[12px] leading-relaxed text-emerald-900/45">
                    {razorpayConfigured
                      ? "Pay securely using UPI, cards, net banking, or wallets. Cash on delivery is not available."
                      : "Gateway keys are not added yet. You can still place the order now and keep payment pending temporarily."}
                  </p>
                </div>
              </section>

              <div className="lg:hidden">
                <CheckoutOrderSummary items={items} subtotal={subtotal} compact />
              </div>

              {errors.submit ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700/85">
                  {errors.submit}
                </p>
              ) : null}

              <motion.button
                type="submit"
                disabled={submitting}
                className="pdp-btn-primary w-full rounded-full py-4 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:w-auto sm:px-12"
                whileHover={reduce || submitting ? undefined : { y: -2 }}
                whileTap={reduce || submitting ? undefined : { scale: 0.985 }}
              >
                {submitting
                  ? razorpayConfigured
                    ? "Processing payment…"
                    : "Placing order…"
                  : razorpayConfigured
                    ? "Pay with Razorpay"
                    : "Place order"}
              </motion.button>
            </div>

            <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--site-header)+1.5rem)]">
              <CheckoutOrderSummary items={items} subtotal={subtotal} />
            </aside>
          </form>
        </div>
      </div>
    </>
  );
}
