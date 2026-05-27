import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import {
  formatPaymentDateTime,
  formatRefundAmount,
  getRefundDetails,
} from "../utils/paymentRefund.js";

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
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/orders/${id}`)
      .then((d) => {
        setOrder(d.order);
        setStatus(d.order.status);
        setTrackingNote(d.order.trackingNote ?? "");
        setCancelReason(d.order.cancelReason ?? "");
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
        body: JSON.stringify({ status, trackingNote, cancelReason }),
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
  const payment = c.payment ?? {};
  const refund = getRefundDetails(order);
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

        <AdminCard title="Payment & refund">
          <div className="space-y-6 text-sm">
            <div>
              <p className="admin-label mb-3">Payment</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-emerald-900/50">Status</dt>
                  <dd className="mt-1 font-medium capitalize text-emerald-900">
                    {payment.status ?? (payment.razorpayPaymentId ? "paid" : "—")}
                    {payment.mode === "test" ? " (test)" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-emerald-900/50">Amount paid</dt>
                  <dd className="mt-1 font-medium">
                    {formatRefundAmount(payment.verifiedAmount ?? order.total)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-emerald-900/50">Paid on</dt>
                  <dd className="mt-1">{formatPaymentDateTime(payment.verifiedAt ?? order.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-emerald-900/50">Payment ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs">{payment.razorpayPaymentId ?? "—"}</dd>
                </div>
              </dl>
            </div>

            {refund ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
                <p className="admin-label mb-3 text-rose-900/70">Refund</p>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-rose-900/55">Refund status</dt>
                    <dd className="mt-1 font-semibold text-rose-800">{refund.statusLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-rose-900/55">Refund amount</dt>
                    <dd className="mt-1 font-display text-lg text-rose-900">
                      {formatRefundAmount(refund.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-rose-900/55">Refunded on</dt>
                    <dd className="mt-1 font-medium text-rose-900/85">
                      {formatPaymentDateTime(refund.refundedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-rose-900/55">Refund reference</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-rose-900/75">
                      {refund.refundId ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : order.status === "cancelled" ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Order cancelled — no refund record on file for this payment.
              </p>
            ) : null}
          </div>
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
            {status === "cancelled" ? (
              <label className="block">
                <span className="admin-label">Cancellation reason</span>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  className="admin-input resize-none"
                  placeholder="Optional reason shown on the order"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="admin-label">Tracking note</span>
              <textarea
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                rows={3}
                className="admin-input resize-none"
              />
            </label>
            {status === "cancelled" && order.status !== "cancelled" ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Saving will cancel this order and restore inventory. Customer refunds are issued
                when the customer cancels before packed.
              </p>
            ) : null}
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
