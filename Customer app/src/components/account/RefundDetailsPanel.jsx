import {
  formatPaymentDateTime,
  formatRefundAmount,
  getRefundDetails,
} from "../../utils/paymentRefund.js";

export function RefundDetailsPanel({ order }) {
  const refund = getRefundDetails(order);
  if (!refund) return null;

  return (
    <div className="mt-4 rounded-2xl border border-emerald-800/15 bg-emerald-900/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900/45">
          Refund details
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            refund.isRefunded ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"
          }`}
        >
          {refund.statusLabel}
        </span>
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
            Refund amount
          </dt>
          <dd className="mt-1 font-display text-lg text-emerald-900">
            {formatRefundAmount(refund.amount)}
          </dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
            Refunded on
          </dt>
          <dd className="mt-1 font-body text-sm text-emerald-900/70">
            {formatPaymentDateTime(refund.refundedAt)}
          </dd>
        </div>
        {refund.refundId ? (
          <div className="sm:col-span-2">
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
              Refund reference
            </dt>
            <dd className="mt-1 break-all font-mono text-xs text-emerald-900/60">{refund.refundId}</dd>
          </div>
        ) : null}
        {refund.refundMode === "test" ? (
          <div className="sm:col-span-2">
            <p className="font-body text-xs text-amber-800/80">Test refund — no real money was charged.</p>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
