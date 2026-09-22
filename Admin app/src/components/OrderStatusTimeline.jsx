import {
  TRACKING_STEPS,
  buildStatusEvents,
  formatStatusDateTime,
  formatStatusLabel,
  getTrackingProgress,
} from "../lib/orderStatus.js";

export function OrderStatusTimeline({ order }) {
  if (!order) return null;

  const events = buildStatusEvents(order);
  const cancelled = order.status === "cancelled";
  const progress = getTrackingProgress(order.status);
  const isDelivered = order.status === "delivered";

  return (
    <div className="space-y-6">
      {cancelled ? (
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--admin-danger)_35%,transparent)] bg-[var(--admin-danger-bg)] px-3 py-2 text-sm text-[var(--admin-danger)]">
          This order was cancelled and is no longer moving through fulfillment.
        </p>
      ) : (
        <ol className="relative space-y-0">
          {TRACKING_STEPS.map((step, index) => {
            const done = index <= progress;
            const active = index === progress && !isDelivered;
            const stepEvent = [...events].reverse().find((e) => e.status === step);

            return (
              <li key={step} className="relative flex gap-3.5 pb-5 last:pb-0">
                {index < TRACKING_STEPS.length - 1 ? (
                  <span
                    className={`absolute left-[0.4375rem] top-5 h-[calc(100%-0.5rem)] w-px ${
                      done
                        ? "bg-[color-mix(in_srgb,var(--admin-badge-fg)_35%,transparent)]"
                        : "bg-[var(--admin-border)]"
                    }`}
                    aria-hidden
                  />
                ) : null}
                <span
                  className={`relative z-[1] mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-[var(--admin-badge-fg)] bg-[var(--admin-badge-fg)]"
                      : "border-[var(--admin-border-strong)] bg-[var(--admin-surface)]"
                  } ${active ? "ring-4 ring-[color-mix(in_srgb,var(--admin-accent)_22%,transparent)]" : ""}`}
                  aria-hidden
                />
                <div className="min-w-0 pt-px">
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-[var(--admin-fg)]" : "text-[var(--admin-fg-faint)]"
                    }`}
                  >
                    {formatStatusLabel(step)}
                  </p>
                  {active ? (
                    <p className="mt-0.5 text-xs text-[var(--admin-accent)]">Current status</p>
                  ) : done && stepEvent?.at ? (
                    <p className="mt-0.5 text-xs text-[var(--admin-fg-faint)]">
                      {formatStatusDateTime(stepEvent.at)}
                    </p>
                  ) : done ? (
                    <p className="mt-0.5 text-xs text-[var(--admin-fg-faint)]">Complete</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div>
        <p className="admin-label mb-3">Status history</p>
        {events.length === 0 ? (
          <p className="text-sm text-[var(--admin-fg-faint)]">No status updates yet.</p>
        ) : (
          <ol className="space-y-3">
            {[...events].reverse().map((event, index) => (
              <li
                key={`${event.status}-${event.at ?? index}`}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3.5 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--admin-fg)]">{event.label}</p>
                  <time className="text-xs text-[var(--admin-fg-faint)]">
                    {formatStatusDateTime(event.at)}
                  </time>
                </div>
                {event.note ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--admin-fg-subtle)]">
                    {event.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
