import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [trackingNote, setTrackingNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/orders/${id}`)
      .then((d) => {
        setOrder(d.order);
        setStatus(d.order.status);
        setTrackingNote(d.order.trackingNote ?? "");
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const d = await apiFetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNote }),
      });
      setOrder(d.order);
      setStatus(d.order.status);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!order && !error) return <LoadingState />;
  if (error && !order) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }

  const c = order.customer ?? {};
  const paymentMethodLabel =
    order.paymentMethod === "razorpay"
      ? "Razorpay"
      : order.paymentMethod === "upi"
        ? "UPI"
        : order.paymentMethod ?? "—";

  return (
    <div>
      <Link to="/orders" className="btn-ghost mb-2 inline-flex gap-1 px-0">
        ← Back to orders
      </Link>

      <PageHeader
        title={order.id}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleString("en-IN")}`}
        action={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Customer details">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="admin-label">Name</dt>
              <dd className="font-medium text-emerald-900">{c.fullName ?? "—"}</dd>
            </div>
            <div>
              <dt className="admin-label">Email</dt>
              <dd>{c.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="admin-label">Phone</dt>
              <dd>{c.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="admin-label">Payment</dt>
              <dd>{paymentMethodLabel}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Update order">
          <form onSubmit={handleSave} className="space-y-5">
            <label className="block">
              <span className="admin-label">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="admin-input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="admin-label">Tracking note</span>
              <textarea
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                rows={3}
                className="admin-input resize-none"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {saved && (
              <p className="rounded-lg bg-emerald-800/10 px-3 py-2 text-sm text-emerald-800">
                Changes saved successfully.
              </p>
            )}
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </form>
        </AdminCard>
      </div>

      <AdminCard title="Order items" className="mt-6">
        <ul className="divide-y divide-emerald-900/6">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <p className="font-medium text-emerald-900">{item.name}</p>
                <p className="text-emerald-900/50">Qty {item.quantity}</p>
              </div>
              <span className="font-medium">
                ₹{(item.priceValue * item.quantity).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
        <div className="gold-line my-4" />
        <div className="flex justify-between text-sm">
          <span className="text-emerald-900/55">Subtotal</span>
          <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-emerald-900/55">Shipping</span>
          <span>₹{order.shipping.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-3 flex justify-between font-display text-xl font-medium text-emerald-900">
          <span>Total</span>
          <span>₹{order.total.toLocaleString("en-IN")}</span>
        </div>
      </AdminCard>
    </div>
  );
}
