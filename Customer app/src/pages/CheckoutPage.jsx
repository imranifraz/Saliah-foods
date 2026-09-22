import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { CheckoutAddressSection } from "../components/checkout/CheckoutAddressSection";
import { CheckoutPaymentSection } from "../components/checkout/CheckoutPaymentSection";
import { CheckoutOrderSummary } from "../components/checkout/CheckoutOrderSummary";
import { OrderSuccessPopup } from "../components/checkout/OrderSuccessPopup";
import { EmailVerificationBanner } from "../components/auth/EmailVerificationBanner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useProfile } from "../context/ProfileContext";
import { addressToCheckoutCustomer } from "../data/profile";
import {
  getEmptyCheckoutForm,
  getDefaultShippingSettings,
  getCheckoutSubmitLabel,
  getShippingFee,
  validateCheckoutForm,
} from "../data/checkout";
import { useGstSettings } from "../context/GstSettingsContext.jsx";
import { createOrderApi } from "../services/orderApi.js";
import {
  createRazorpayOrderApi,
  fetchPaymentMethodsApi,
  loadRazorpayCheckout,
  verifyRazorpayPaymentApi,
  verifyTestPaymentApi,
} from "../services/paymentApi.js";
import { trackPurchase } from "../lib/analytics.js";
import { isEmailVerificationRequired } from "../lib/emailVerificationPolicy.js";

export function CheckoutPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { user, emailVerified, resendVerificationEmail } = useAuth();
  const { items, subtotal, discountTotal, clearCart, closeCart } = useCart();
  const { calcOrderBreakdown } = useGstSettings();
  const { addOrder } = useOrders();
  const { addresses, defaultAddress, addAddress, loading: addressesLoading } = useProfile();

  const [addressMode, setAddressMode] = useState("new");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newForm, setNewForm] = useState({ ...getEmptyCheckoutForm(), addressLabel: "" });
  const [saveNewToProfile, setSaveNewToProfile] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [testPaymentsAllowed, setTestPaymentsAllowed] = useState(false);
  const [shippingSettings, setShippingSettings] = useState(getDefaultShippingSettings);

  useEffect(() => {
    if (completedOrder) trackPurchase(completedOrder);
  }, [completedOrder]);

  useEffect(() => {
    if (addressesLoading) return;

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
  }, [addresses, defaultAddress, user, addressesLoading]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function loadPaymentMethods() {
      setPaymentMethodsLoading(true);
      try {
        const data = await fetchPaymentMethodsApi();
        if (cancelled) return;
        const methods = data.methods ?? [];
        setPaymentMethods(methods);
        setPaymentMethod((current) => {
          if (current && methods.some((method) => method.id === current)) return current;
          // Prefer COD for reliable local testing when Razorpay keys are placeholders.
          return methods.find((method) => method.id === "cod")?.id ?? methods[0]?.id ?? "";
        });
        setRazorpayConfigured(data.razorpayConfigured === true);
        setTestPaymentsAllowed(data.testPaymentsAllowed === true);
        if (data.shipping) {
          setShippingSettings({
            freeShippingThreshold: Number(
              data.shipping.freeShippingThreshold ?? getDefaultShippingSettings().freeShippingThreshold
            ),
            shippingFee: Number(data.shipping.shippingFee ?? getDefaultShippingSettings().shippingFee),
          });
        }
      } catch {
        if (cancelled) return;
        attempts += 1;
        if (attempts < 3) {
          window.setTimeout(loadPaymentMethods, 800 * attempts);
          return;
        }
        setPaymentMethods([]);
        setPaymentMethod("");
      } finally {
        if (!cancelled) setPaymentMethodsLoading(false);
      }
    }

    loadPaymentMethods();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0 && !completedOrder) {
    return <Navigate to="/products" replace />;
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
      if (saveNewToProfile && !newForm.addressLabel?.trim()) {
        nextErrors.addressLabel = "Address label is required when saving to profile";
      }
    }

    if (!paymentMethod) nextErrors.paymentMethod = "Select a payment method";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    let customer;
    let addressSaveWarning = "";

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
        phone: newForm.phone.trim().replace(/\s/g, "").replace(/^\+91/, "").slice(-10),
        addressLine1: newForm.addressLine1.trim(),
        addressLine2: newForm.addressLine2.trim(),
        city: newForm.city.trim(),
        state: newForm.state,
        pincode: newForm.pincode.trim(),
        paymentMethod,
        addressLabel: newForm.addressLabel.trim() || "Home",
      };

      if (saveNewToProfile) {
        try {
          await addAddress({
            label: customer.addressLabel,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            addressLine1: customer.addressLine1,
            addressLine2: customer.addressLine2,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
          });
        } catch (err) {
          // Do not block order placement if the address book save fails.
          addressSaveWarning = err.message ?? "Could not save address to your profile";
        }
      }
    }

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const shipping = getShippingFee(subtotal, shippingSettings);
      const pricing = calcOrderBreakdown(subtotal, shipping);
      let paymentVerificationToken = null;

      if (paymentMethod === "razorpay") {
        if (testPaymentsAllowed && !razorpayConfigured) {
          const paymentVerification = await verifyTestPaymentApi({ amount: pricing.total });
          paymentVerificationToken = paymentVerification.verificationToken;
        } else if (razorpayConfigured) {
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
        } else {
          throw new Error("Online payment is not available right now. Please choose Cash on Delivery.");
        }
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

      // Show success first so an empty cart cannot redirect away from checkout.
      setCompletedOrder(data.order);
      try {
        addOrder(data.order);
      } catch {
        /* order already placed — ignore local list refresh errors */
      }
      closeCart();
      clearCart();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: addressSaveWarning
          ? `${err.message} (Also: ${addressSaveWarning})`
          : err.message || "Could not place order. Check the backend is running on port 3001.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const requiresOnlinePayment = paymentMethod === "razorpay";
  const onlinePaymentReady = razorpayConfigured || testPaymentsAllowed;
  const canSubmit =
    !paymentMethodsLoading &&
    Boolean(paymentMethod) &&
    paymentMethods.length > 0 &&
    (!requiresOnlinePayment || onlinePaymentReady);

  if (completedOrder) {
    return (
      <>
        <PageMeta title="Order confirmed" description="Your Saliah Foods order has been placed successfully." />
        <OrderSuccessPopup
          order={completedOrder}
          onClose={() => navigate("/products", { replace: true })}
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
              {paymentMethodsLoading
                ? "Loading checkout options…"
                : paymentMethods.length
                  ? "Select a delivery address and your preferred payment method."
                  : "Checkout is unavailable until at least one payment method is enabled in admin."}
            </p>
          </motion.header>

          {!isEmailVerificationRequired() ? null : !emailVerified && user?.email ? (
            <EmailVerificationBanner
              email={user.email}
              onResend={resendVerificationEmail}
              className="mt-6"
              compact
            />
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
            <div className="space-y-6">
              <CheckoutAddressSection
                savedAddresses={addresses}
                addressesLoading={addressesLoading}
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

              <CheckoutPaymentSection
                methods={paymentMethods}
                loading={paymentMethodsLoading}
                value={paymentMethod}
                onChange={(nextMethod) => {
                  setPaymentMethod(nextMethod);
                  if (errors.paymentMethod) {
                    setErrors((prev) => ({ ...prev, paymentMethod: undefined }));
                  }
                }}
                error={errors.paymentMethod}
                razorpayConfigured={razorpayConfigured}
                testPaymentsAllowed={testPaymentsAllowed}
              />

              <div className="lg:hidden">
                <CheckoutOrderSummary
                  items={items}
                  subtotal={subtotal}
                  discountTotal={discountTotal}
                  shippingSettings={shippingSettings}
                  compact
                  editable
                />
              </div>

              {errors.submit ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700/85">
                  {errors.submit}
                </p>
              ) : null}

              <motion.button
                type="submit"
                disabled={submitting || !canSubmit || paymentMethodsLoading}
                className="pdp-btn-primary w-full rounded-full py-4 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:w-auto sm:px-12"
                whileHover={reduce || submitting ? undefined : { y: -2 }}
                whileTap={reduce || submitting ? undefined : { scale: 0.985 }}
              >
                {getCheckoutSubmitLabel(paymentMethod, {
                  submitting,
                  emailVerified: true,
                  razorpayConfigured,
                  testPaymentsAllowed,
                })}
              </motion.button>
            </div>

            <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--site-header)+1.5rem)]">
              <CheckoutOrderSummary
                items={items}
                subtotal={subtotal}
                discountTotal={discountTotal}
                shippingSettings={shippingSettings}
                editable
              />
            </aside>
          </form>
        </div>
      </div>
    </>
  );
}
