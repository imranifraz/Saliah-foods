export function CheckoutPaymentSection({
  methods,
  loading,
  value,
  onChange,
  error,
  razorpayConfigured,
  testPaymentsAllowed,
}) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-cream-200/80 bg-white/90 p-5 md:p-6">
        <h2 className="font-display text-lg text-emerald-900">Payment method</h2>
        <p className="mt-3 font-body text-sm text-emerald-900/45">Loading payment options…</p>
      </section>
    );
  }

  if (!methods.length) {
    return (
      <section className="rounded-2xl border border-cream-200/80 bg-white/90 p-5 md:p-6">
        <h2 className="font-display text-lg text-emerald-900">Payment method</h2>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-body text-sm text-amber-900/80">
          No payment methods are available right now. Please check back later or contact support.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cream-200/80 bg-white/90 p-5 md:p-6">
      <h2 className="font-display text-lg text-emerald-900">Payment method</h2>

      <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
        {methods.map((method) => {
          const selected = value === method.id;
          const isRazorpay = method.id === "razorpay";

          return (
            <label
              key={method.id}
              className={`block cursor-pointer rounded-xl border px-4 py-4 transition ${
                selected
                  ? "border-emerald-800/25 bg-emerald-900/[0.04] ring-1 ring-emerald-800/10"
                  : "border-emerald-900/10 bg-white hover:border-emerald-900/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={selected}
                  onChange={() => onChange(method.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-emerald-800"
                />
                <span className="min-w-0">
                  <span className="block font-body text-sm font-medium text-emerald-900">{method.label}</span>
                  <span className="mt-1 block font-body text-[12px] leading-relaxed text-emerald-900/45">
                    {method.description}
                  </span>
                  {isRazorpay && !razorpayConfigured && testPaymentsAllowed ? (
                    <span className="mt-2 block font-body text-[11px] text-amber-800/80">
                      Razorpay keys are not configured — test mode will simulate payment.
                    </span>
                  ) : null}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {error ? <p className="mt-3 font-body text-[12px] text-red-700/80">{error}</p> : null}
    </section>
  );
}
