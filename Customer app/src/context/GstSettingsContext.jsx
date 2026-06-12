import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calcOrderBreakdown as calcOrderBreakdownBase, getDefaultGstSettings } from "../data/pricing.js";
import { fetchPaymentMethodsApi } from "../services/paymentApi.js";

const GstSettingsContext = createContext(null);

export function GstSettingsProvider({ children }) {
  const [settings, setSettings] = useState(getDefaultGstSettings);
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      ...settings,
      loading,
      calcOrderBreakdown: (subtotal, shipping = 0) => calcOrderBreakdownBase(subtotal, shipping, settings),
    }),
    [settings, loading]
  );

  return <GstSettingsContext.Provider value={value}>{children}</GstSettingsContext.Provider>;
}

export function useGstSettings() {
  const context = useContext(GstSettingsContext);
  if (!context) {
    const defaults = getDefaultGstSettings();
    return {
      ...defaults,
      loading: false,
      calcOrderBreakdown: (subtotal, shipping = 0) => calcOrderBreakdownBase(subtotal, shipping, defaults),
    };
  }
  return context;
}
