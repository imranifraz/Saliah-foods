import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

export function PaymentsPage() {
  const [methods, setMethods] = useState([]);
  const [store, setStore] = useState({
    freeShippingThreshold: 999,
    shippingFee: 99,
    codEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function load() {
    setLoading(true);
    apiFetch("/api/admin/payments")
      .then((d) => {
        setMethods(d.methods);
        setStore(d.store);
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

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Payments & Shipping"
        subtitle="Configure checkout payment methods and shipping rules for the customer app."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Payment methods">
          <ul className="divide-y divide-emerald-900/6">
            {methods.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-emerald-900">{m.label}</p>
                  <p className="text-sm text-emerald-900/50">{m.description}</p>
                  <p className="text-xs text-emerald-900/40">ID: {m.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMethod(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
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
      </div>
    </div>
  );
}
