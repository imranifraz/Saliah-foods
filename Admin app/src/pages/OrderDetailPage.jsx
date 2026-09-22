import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { OrderStatusTimeline } from "../components/OrderStatusTimeline.jsx";
import { ORDER_STATUS_LABELS } from "../lib/orderStatus.js";
import {
  formatPaymentDateTime,
  formatRefundAmount,
  getRefundDetails,
} from "../utils/paymentRefund.js";
import { useAdminToast } from "../context/AdminToastContext.jsx";

const STATUSES = Object.keys(ORDER_STATUS_LABELS);

export function OrderDetailPage() {
  const toast = useAdminToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/orders/${id}`)
      .then((d) => {
        setOrder(d.order);
        setStatus(d.order.status);
        setStatusNote("");
        setCancelReason(d.order.cancelReason ?? "");
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const manualPaymentMethods = new Set(["cod", "upi", "card"]);
  const canMarkPaid =
    manualPaymentMethods.has(order?.paymentMethod) &&
    (order?.customer?.payment?.status ?? "pending") === "pending";

  async function handleMarkPaid() {
    setError("");
    setMarkingPaid(true);
    try {
      const d = await apiFetch(`/api/admin/orders/${id}/payment/mark-paid`, { method: "PATCH" });
      setOrder(d.order);
      toast.success("Payment marked received");
    } catch (err) {
      setError(err.message);
      toast.error("Could not mark payment", err.message);
    } finally {
      setMarkingPaid(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const d = await apiFetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          cancelReason,
          ...(status !== order.status ? { trackingNote: statusNote.trim() } : {}),
        }),
      });
      setOrder(d.order);
      setStatus(d.order.status);
      setStatusNote("");
      setCancelReason(d.order.cancelReason ?? "");
      setSaved(true);
      toast.success("Order status updated");
    } catch (err) {
      setError(err.message);
      toast.error("Could not update order", err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      toast.success("Order deleted");
      navigate("/orders");
    } catch (err) {
      setError(err.message ?? "Could not delete order");
      toast.error("Could not delete order", err.message);
      setDeleting(false);
      setConfirmDelete(false);
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
  const paymentMethodLabels = {
    razorpay: "Razorpay",
    upi: "UPI",
    card: "Card",
    cod: "Cash on delivery",
  };
  const paymentMethodLabel = paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod ?? "—";

  return (
    <div>
      <PageHeader
        title={order.id}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleString("en-IN")}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <button
              type="button"
              className="btn-ghost text-sm text-red-700 hover:bg-red-50"
              disabled={deleting}
              onClick={() => setConfirmDelete(true)}
            >
              Delete order
            </button>
          </div>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

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
                    {payment.status === "paid"
                      ? formatRefundAmount(payment.verifiedAmount ?? order.total)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-emerald-900/50">Paid on</dt>
                  <dd className="mt-1">
                    {payment.verifiedAt ? formatPaymentDateTime(payment.verifiedAt) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-emerald-900/50">Payment ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs">{payment.razorpayPaymentId ?? "—"}</dd>
                </div>
              </dl>
              {canMarkPaid ? (
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={markingPaid}
                    onClick={handleMarkPaid}
                  >
                    {markingPaid ? "Marking paid…" : "Mark payment as received"}
                  </button>
                  <p className="mt-2 text-xs text-emerald-900/45">
                    Use after the customer pays by UPI, card, or cash on delivery.
                  </p>
                </div>
              ) : null}
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

        <AdminCard
          title="Fulfillment timeline"
          subtitle="Same progress steps customers see, plus full status history"
        >
          <OrderStatusTimeline order={order} />
        </AdminCard>

        <AdminCard title="Update status">
          <form onSubmit={handleSave} className="space-y-5">
            <label className="block">
              <span className="admin-label">New status</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setSaved(false);
                }}
                className="admin-input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
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
              <span className="admin-label">Note for this update</span>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="admin-input resize-none"
                placeholder={
                  status !== order.status
                    ? `Optional — appears on the timeline when moving to “${ORDER_STATUS_LABELS[status]}”`
                    : "Optional — leave blank, or change status to add a timeline note"
                }
              />
              <span className="mt-1.5 block text-xs text-[var(--admin-fg-faint)]">
                Notes are saved on the status history timeline when the status changes.
              </span>
            </label>
            {status === "cancelled" && order.status !== "cancelled" ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Saving will cancel this order and restore inventory. Customer refunds are issued
                when the customer cancels before packed.
              </p>
            ) : null}
            {status !== order.status ? (
              <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover)] px-3 py-2 text-sm text-[var(--admin-fg-muted)]">
                Moving from{" "}
                <span className="font-medium text-[var(--admin-fg)]">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>{" "}
                →{" "}
                <span className="font-medium text-[var(--admin-fg)]">
                  {ORDER_STATUS_LABELS[status] ?? status}
                </span>
              </p>
            ) : null}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {saved && (
              <p className="rounded-lg bg-emerald-800/10 px-3 py-2 text-sm text-emerald-800">
                Status timeline updated.
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Update status"}
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
                <p className="text-emerald-900/50">
                  Qty {item.quantity}
                  {item.bogoApplied ? " · Buy 1 Get 1 Free" : ""}
                  {item.packSize ? ` · ${item.packSize}` : ""}
                </p>
              </div>
              <span className="font-medium">
                ₹
                {(
                  item.lineTotal != null
                    ? item.lineTotal
                    : Math.max(0, item.priceValue * item.quantity - (item.lineDiscount ?? 0))
                ).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
        <div className="gold-line my-4" />
        {(order.discountTotal ?? 0) > 0 ? (
          <div className="flex justify-between text-sm text-emerald-800">
            <span>Offer savings</span>
            <span>−₹{order.discountTotal.toLocaleString("en-IN")}</span>
          </div>
        ) : null}
        <div className="mt-1 flex justify-between text-sm">
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

      <ConfirmDialog
        open={confirmDelete}
        title="Delete order?"
        description={`Permanently delete ${order.id}? Reserved stock for open orders will be released. This cannot be undone.`}
        confirmLabel="Delete order"
        danger
        loading={deleting}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
