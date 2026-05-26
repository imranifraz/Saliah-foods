import { ORDER_STATUSES, TRACKING_STEPS, getTrackingProgress } from "../../data/orders";

export function OrderTrackingTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <p className="mt-4 font-body text-sm text-red-800/75">
        This order was cancelled and is no longer being processed.
      </p>
    );
  }

  const progress = getTrackingProgress(status);
  const isDelivered = status === "delivered";

  return (
    <ol className="account-timeline relative mt-5 space-y-0">
      {TRACKING_STEPS.map((step, index) => {
        const done = index <= progress;
        const active = index === progress && !isDelivered;
        const meta = ORDER_STATUSES[step];

        return (
          <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
            {index < TRACKING_STEPS.length - 1 ? (
              <span
                className={`absolute left-[0.5rem] top-6 h-[calc(100%-0.75rem)] w-px ${done ? "bg-emerald-800/20" : "bg-cream-200"}`}
                aria-hidden
              />
            ) : null}
            <span
              className={`relative z-[1] mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                done ? "border-emerald-800 bg-emerald-800" : "border-cream-200 bg-white"
              } ${active ? "ring-4 ring-gold-400/15" : ""}`}
              aria-hidden
            />
            <div className={done ? "account-timeline__step--done" : ""}>
              <p className={`font-body text-sm font-medium ${done ? "text-emerald-900" : "text-emerald-900/32"}`}>
                {meta.label}
              </p>
              {active ? (
                <p className="mt-0.5 font-body text-xs text-gold-600/80">In progress</p>
              ) : done ? (
                <p className="mt-0.5 font-body text-xs text-emerald-900/35">Complete</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
