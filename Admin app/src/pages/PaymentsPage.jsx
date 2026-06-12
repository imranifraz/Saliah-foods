import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const EMPTY_GST = {
  ratePercent: 5,
  rate: 0.05,
  label: "GST (5%)",
  gstin: "",
  showOnProducts: true,
  pricesIncludeGst: true,
};

const EMPTY_RAZORPAY = {
  configured: false,
  active: false,
  enabled: true,
  keyId: "",
  maskedKeyId: "",
  keySecretSet: false,
  source: "none",
};

export function PaymentsPage() {
  const [methods, setMethods] = useState([]);
  const [store, setStore] = useState({
    freeShippingThreshold: 999,
    shippingFee: 99,
    codEnabled: true,
  });
  const [razorpay, setRazorpay] = useState(EMPTY_RAZORPAY);
  const [razorpayForm, setRazorpayForm] = useState({
    keyId: "",
    keySecret: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [razorpaySaved, setRazorpaySaved] = useState(false);
  const [savingRazorpay, setSavingRazorpay] = useState(false);
  const [gst, setGst] = useState(EMPTY_GST);
  const [gstSaved, setGstSaved] = useState(false);
  const [savingGst, setSavingGst] = useState(false);

  function load() {
    setLoading(true);
    apiFetch("/api/admin/payments")
      .then((d) => {
        setMethods(d.methods);
        setStore(d.store);
        const nextRazorpay = d.razorpay ?? EMPTY_RAZORPAY;
        setRazorpay(nextRazorpay);
        setRazorpayForm({
          keyId: nextRazorpay.keyId ?? "",
          keySecret: "",
          enabled: nextRazorpay.enabled !== false,
        });
        setGst(d.gst ?? EMPTY_GST);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleMethod(m) {
    try {
      await apiFetch(`/api/admin/payments/methods/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !m.enabled }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveStore(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await apiFetch("/api/admin/payments/store", {
        method: "PUT",
        body: JSON.stringify(store),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateGstRate(ratePercent) {
    const safeRate = Number.isFinite(ratePercent) ? ratePercent : EMPTY_GST.ratePercent;
    setGst((prev) => ({
      ...prev,
      ratePercent: safeRate,
      label: prev.label === `GST (${prev.ratePercent}%)` ? `GST (${safeRate}%)` : prev.label,
    }));
  }

  async function saveGst(e) {
    e.preventDefault();
    setError("");
    setGstSaved(false);
    setSavingGst(true);
    try {
      const data = await apiFetch("/api/admin/payments/gst", {
        method: "PUT",
        body: JSON.stringify(gst),
      });
      setGst(data.gst ?? gst);
      setGstSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingGst(false);
    }
  }

  async function saveRazorpay(e) {
    e.preventDefault();
    setError("");
    setRazorpaySaved(false);
    setSavingRazorpay(true);
    try {
      const data = await apiFetch("/api/admin/payments/razorpay", {
        method: "PUT",
        body: JSON.stringify(razorpayForm),
      });
      const nextRazorpay = data.razorpay ?? EMPTY_RAZORPAY;
      setRazorpay(nextRazorpay);
      setRazorpayForm((prev) => ({
        keyId: nextRazorpay.keyId ?? prev.keyId,
        keySecret: "",
        enabled: nextRazorpay.enabled !== false,
      }));
      setRazorpaySaved(true);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingRazorpay(false);
    }
  }

  if (loading) return <LoadingState />;

  const razorpayStatusLabel = razorpay.active
    ? "Connected"
    : razorpay.configured
      ? "Configured (disabled)"
      : "Not connected";

  const razorpaySecretPlaceholder = !razorpay.keySecretSet
    ? "Enter your Razorpay key secret"
    : razorpay.source === "environment"
      ? "Leave blank to import the secret from server environment variables"
      : "Leave blank to keep the saved secret";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Shipping"
        subtitle="Configure checkout payment methods and shipping rules for the customer app."
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminCard
        title="Razorpay account"
        subtitle="Connect your Razorpay API keys to accept online payments at checkout."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
          <div>
            <p className="text-sm font-medium text-[var(--admin-fg)]">{razorpayStatusLabel}</p>
            <p className="mt-1 text-xs text-[var(--admin-fg-muted)]">
              {razorpay.active
                ? `Key ID ${razorpay.maskedKeyId || razorpay.keyId}`
                : "Add your Key ID and Key Secret from the Razorpay dashboard."}
            </p>
            {razorpay.source === "environment" ? (
              <p className="mt-1 text-xs text-amber-700">
                Keys are currently loaded from server environment variables. Saving here will store them in the database instead.
              </p>
            ) : null}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              razorpay.active
                ? "bg-emerald-800/12 text-emerald-800"
                : razorpay.configured
                  ? "bg-amber-50 text-amber-800"
                  : "bg-red-50 text-red-600"
            }`}
          >
            {razorpayStatusLabel}
          </span>
        </div>

        <form onSubmit={saveRazorpay} className="mt-5 space-y-4">
          <label className="block">
            <span className="admin-label">Key ID</span>
            <input
              value={razorpayForm.keyId}
              onChange={(e) => setRazorpayForm({ ...razorpayForm, keyId: e.target.value.trim() })}
              className="admin-input mt-1.5 w-full font-mono text-sm"
              placeholder="rzp_test_xxxxxxxx"
              autoComplete="off"
            />
          </label>

          <label className="block">
            <span className="admin-label">Key Secret</span>
            <input
              type="password"
              value={razorpayForm.keySecret}
              onChange={(e) => setRazorpayForm({ ...razorpayForm, keySecret: e.target.value })}
              className="admin-input mt-1.5 w-full font-mono text-sm"
              placeholder={razorpaySecretPlaceholder}
              autoComplete="new-password"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={razorpayForm.enabled}
              onChange={(e) => setRazorpayForm({ ...razorpayForm, enabled: e.target.checked })}
            />
            <span className="text-sm">Enable Razorpay at checkout</span>
          </label>

          <p className="text-xs text-[var(--admin-fg-muted)]">
            Get API keys from{" "}
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--admin-link)] underline"
            >
              dashboard.razorpay.com
            </a>
            . Use test keys while developing and live keys in production.
          </p>

          {razorpaySaved ? <p className="text-sm text-emerald-800">Razorpay account saved.</p> : null}

          <button type="submit" className="btn-primary" disabled={savingRazorpay}>
            {savingRazorpay ? "Saving…" : razorpay.configured ? "Update connection" : "Connect Razorpay"}
          </button>
        </form>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <AdminCard title="Payment methods">
          <ul className="divide-y divide-emerald-900/6">
            {methods.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-emerald-900">{m.label}</p>
                  <p className="text-sm text-emerald-900/50">{m.description}</p>
                  <p className="text-xs text-emerald-900/40">ID: {m.id}</p>
                  {m.id === "razorpay" && !razorpay.configured ? (
                    <p className="mt-1 text-xs text-amber-700">Connect Razorpay above to enable online payments.</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => toggleMethod(m)}
                  disabled={m.id === "razorpay" && !razorpay.configured}
                  className={`rounded-full px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                    m.enabled ? "bg-emerald-800/12 text-emerald-800" : "bg-red-50 text-red-600"
                  }`}
                >
                  {m.enabled ? "Enabled" : "Disabled"}
                </button>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Shipping settings">
          <form onSubmit={saveStore} className="space-y-4">
            <label className="block">
              <span className="admin-label">Free shipping above (₹)</span>
              <input
                type="number"
                value={store.freeShippingThreshold}
                onChange={(e) =>
                  setStore({ ...store, freeShippingThreshold: Number(e.target.value) })
                }
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Standard shipping fee (₹)</span>
              <input
                type="number"
                value={store.shippingFee}
                onChange={(e) => setStore({ ...store, shippingFee: Number(e.target.value) })}
                className="admin-input"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={store.codEnabled}
                onChange={(e) => setStore({ ...store, codEnabled: e.target.checked })}
              />
              <span className="text-sm">Cash on delivery available</span>
            </label>
            {saved && (
              <p className="text-sm text-emerald-800">Shipping settings saved.</p>
            )}
            <button type="submit" className="btn-primary">
              Save shipping
            </button>
          </form>
        </AdminCard>

        <AdminCard title="GST settings" subtitle="Used for checkout totals, product labels, and invoices.">
          <form onSubmit={saveGst} className="space-y-4">
            <label className="block">
              <span className="admin-label">GST rate (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={gst.ratePercent}
                onChange={(e) => updateGstRate(Number(e.target.value))}
                className="admin-input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="admin-label">Display label</span>
              <input
                value={gst.label}
                onChange={(e) => setGst({ ...gst, label: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder={`GST (${gst.ratePercent}%)`}
              />
            </label>
            <label className="block">
              <span className="admin-label">GSTIN</span>
              <input
                value={gst.gstin}
                onChange={(e) => setGst({ ...gst, gstin: e.target.value.toUpperCase() })}
                className="admin-input mt-1.5 w-full font-mono text-sm"
                placeholder="22AAAAA0000A1Z5"
                autoComplete="off"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gst.pricesIncludeGst !== false}
                onChange={(e) => setGst({ ...gst, pricesIncludeGst: e.target.checked })}
              />
              <span className="text-sm">Product prices include GST</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gst.showOnProducts !== false}
                onChange={(e) => setGst({ ...gst, showOnProducts: e.target.checked })}
              />
              <span className="text-sm">Show “Incl. GST” on product prices</span>
            </label>
            {gstSaved ? <p className="text-sm text-emerald-800">GST settings saved.</p> : null}
            <button type="submit" className="btn-primary" disabled={savingGst}>
              {savingGst ? "Saving…" : "Save GST settings"}
            </button>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
