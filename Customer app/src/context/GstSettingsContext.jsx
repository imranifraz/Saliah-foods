import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calcOrderBreakdown as calcOrderBreakdownBase, getDefaultGstSettings } from "../data/pricing.js";
import { getDefaultShippingSettings } from "../data/checkout.js";
import { fetchPaymentMethodsApi } from "../services/paymentApi.js";

const GstSettingsContext = createContext(null);

function formatThreshold(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

export function formatShippingPromoMessage(template, threshold) {
  const amount = formatThreshold(threshold);
  let raw = String(template || "").trim();
  if (!raw) return `Get FREE shipping on orders above ₹${amount}`;

  raw = raw
    .replaceAll("{threshold}", amount)
    .replaceAll("{amount}", amount);

  // Keep any hardcoded ₹ amounts in sync with the live free-shipping threshold.
  raw = raw.replace(/₹\s*[\d,]+/g, `₹${amount}`);

  return raw;
}

export function GstSettingsProvider({ children }) {
  const [settings, setSettings] = useState(getDefaultGstSettings);
  const [shipping, setShipping] = useState(getDefaultShippingSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethodsApi()
      .then((data) => {
        if (data.gst) {
          setSettings({
            ...getDefaultGstSettings(),
            ...data.gst,
            rate: Number(data.gst.rate ?? data.gst.ratePercent / 100),
          });
        }
        if (data.shipping) {
          setShipping({
            ...getDefaultShippingSettings(),
            ...data.shipping,
            freeShippingThreshold: Number(
              data.shipping.freeShippingThreshold ?? getDefaultShippingSettings().freeShippingThreshold
            ),
            shippingFee: Number(data.shipping.shippingFee ?? getDefaultShippingSettings().shippingFee),
            promoBarEnabled: data.shipping.promoBarEnabled !== false,
            promoBarMessage:
              data.shipping.promoBarMessage || getDefaultShippingSettings().promoBarMessage,
            promoBarHref: data.shipping.promoBarHref ?? getDefaultShippingSettings().promoBarHref,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    const promoEnabled = shipping.promoBarEnabled !== false;
    const promoMessage = formatShippingPromoMessage(
      shipping.promoBarMessage,
      shipping.freeShippingThreshold
    );

    return {
      ...settings,
      loading,
      shipping,
      shippingPromo: {
        enabled: promoEnabled,
        message: promoMessage,
        href: String(shipping.promoBarHref ?? "").trim(),
        threshold: shipping.freeShippingThreshold,
      },
      calcOrderBreakdown: (subtotal, shippingFee = 0) =>
        calcOrderBreakdownBase(subtotal, shippingFee, settings),
    };
  }, [settings, shipping, loading]);

  return <GstSettingsContext.Provider value={value}>{children}</GstSettingsContext.Provider>;
}

export function useGstSettings() {
  const context = useContext(GstSettingsContext);
  if (!context) {
    const defaults = getDefaultGstSettings();
    const shipping = getDefaultShippingSettings();
    return {
      ...defaults,
      loading: false,
      shipping,
      shippingPromo: {
        enabled: shipping.promoBarEnabled !== false,
        message: formatShippingPromoMessage(shipping.promoBarMessage, shipping.freeShippingThreshold),
        href: shipping.promoBarHref,
        threshold: shipping.freeShippingThreshold,
      },
      calcOrderBreakdown: (subtotal, shippingFee = 0) =>
        calcOrderBreakdownBase(subtotal, shippingFee, defaults),
    };
  }
  return context;
}

export function useShippingPromo() {
  const { shippingPromo, loading } = useGstSettings();
  return { ...shippingPromo, loading };
}
