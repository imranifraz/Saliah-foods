import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterDock, AdminFilterSegment } from "../components/ui/AdminFilterDock.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_STYLES = {
  pending: "bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]",
  approved: "bg-[var(--admin-badge-bg)] text-[var(--admin-badge-fg)]",
  rejected: "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]",
};

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] ?? "border border-[var(--admin-border)] bg-[var(--admin-hover)] text-[var(--admin-fg-muted)]"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={index < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={index < rating ? "text-gold-600" : "text-cream-300"}
          aria-hidden
        >
          <path d="M12 3.25l2.77 5.61 6.19.9-4.48 4.37 1.06 6.17L12 17.34l-5.54 2.91 1.06-6.17-4.48-4.37 6.19-.9L12 3.25z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-medium text-emerald-900/65">{rating.toFixed(1)}</span>
    </div>
  );
}

function matchesProductQuery(review, query) {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  const name = String(review.product?.name ?? review.orderItem?.name ?? "").toLowerCase();
  const slug = String(review.product?.slug ?? "").toLowerCase();

  return name.includes(term) || slug.includes(term);
}

export function ReviewsPage() {
  const toast = useAdminToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const productQuery = searchParams.get("q") ?? "";
  const [status, setStatus] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [moderationNote, setModerationNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  function load() {
    setLoading(true);
    setError("");
    apiFetch(`/api/admin/reviews?status=${status}`)
      .then((data) => {
        const nextReviews = data.reviews ?? [];
        setReviews(nextReviews);
        setSelectedReviewId((current) =>
          nextReviews.some((review) => review.id === current) ? current : nextReviews[0]?.id ?? null
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [status]);

  const filteredReviews = useMemo(
    () => reviews.filter((review) => matchesProductQuery(review, productQuery)),
    [reviews, productQuery]
  );

  const selectedReview = useMemo(
    () => filteredReviews.find((review) => review.id === selectedReviewId) ?? null,
    [filteredReviews, selectedReviewId]
  );

  useEffect(() => {
    setSelectedReviewId((current) =>
      filteredReviews.some((review) => review.id === current) ? current : filteredReviews[0]?.id ?? null
    );
  }, [filteredReviews]);

  useEffect(() => {
    setModerationNote(selectedReview?.moderationNote ?? "");
  }, [selectedReview]);

  async function moderate(nextStatus) {
    if (!selectedReview) return;

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const data = await apiFetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          moderationNote,
        }),
      });
      setFeedback(`Review ${data.review.status}.`);
      toast.success(`Review ${data.review.status}`);
      if (status !== "all" && status !== nextStatus) {
        setSelectedReviewId(null);
      } else {
        setSelectedReviewId(data.review.id);
      }
      load();
    } catch (err) {
      setError(err.message);
      toast.error("Could not update review", err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Review Moderation"
        subtitle="Approve only genuine reviews from delivered purchases before they appear on the storefront."
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </p>
      ) : null}

      <AdminFilterDock
        title="Find reviews"
        className="mb-6"
        chips={
          productQuery.trim()
            ? [
                {
                  key: "product",
                  label: `Product: ${productQuery.trim()}`,
                  onRemove: () => setSearchParams({}, { replace: true }),
                },
              ]
            : []
        }
        onClearAll={productQuery.trim() ? () => setSearchParams({}, { replace: true }) : undefined}
      >
        <AdminFilterSegment label="Status" options={STATUS_TABS} value={status} onChange={setStatus} />
      </AdminFilterDock>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <AdminCard title="Customer reviews">
          {loading ? (
            <LoadingState label="Loading reviews..." />
          ) : (
            <DataTable
              columns={["Customer", "Product", "Rating", "Status", "Submitted", ""]}
              emptyMessage={productQuery.trim() ? "No reviews match this product filter" : "No reviews in this view"}
            >
              {filteredReviews.map((review) => (
                <DataRow
                  key={review.id}
                  className={selectedReviewId === review.id ? "bg-cream-100/50" : ""}
                >
                  <DataCell>
                    <div>
                      <p className="font-medium">{review.customer?.fullName ?? "Customer"}</p>
                      <p className="mt-1 text-xs text-emerald-900/45">{review.customer?.email ?? ""}</p>
                    </div>
                  </DataCell>
                  <DataCell>
                    <div>
                      <p className="font-medium">{review.product?.name ?? review.orderItem?.name ?? "Product"}</p>
                      <p className="mt-1 text-xs text-emerald-900/45">
                        {review.orderItem?.packSize || review.product?.categoryLabel || ""}
                      </p>
                    </div>
                  </DataCell>
                  <DataCell>
                    <ReviewStars rating={review.rating} />
                  </DataCell>
                  <DataCell>
                    <StatusBadge status={review.status} />
                  </DataCell>
                  <DataCell className="text-emerald-900/65">
                    {formatDateTime(review.submittedAt)}
                  </DataCell>
                  <DataCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReviewId(review.id)}
                      className="btn-ghost"
                    >
                      Review
                    </button>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          )}
        </AdminCard>

        <AdminCard title="Review detail">
          {!selectedReview ? (
            <p className="text-sm text-emerald-900/50">Select a review to inspect and moderate it.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-emerald-900">
                    {selectedReview.product?.name ?? selectedReview.orderItem?.name}
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/45">
                    Order {selectedReview.order?.id} · {selectedReview.customer?.fullName}
                  </p>
                </div>
                <StatusBadge status={selectedReview.status} />
              </div>

              <ReviewStars rating={selectedReview.rating} />

              {selectedReview.title ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900/35">
                    Headline
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">{selectedReview.title}</p>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900/35">
                  Review
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900/70">
                  {selectedReview.comment}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-900/10 bg-cream-50/70 p-4 text-sm text-emerald-900/65">
                <p>Submitted: {formatDateTime(selectedReview.submittedAt)}</p>
                <p className="mt-1">
                  Product slug: <span className="font-medium">{selectedReview.product?.slug ?? "-"}</span>
                </p>
                <p className="mt-1">
                  Pack size: <span className="font-medium">{selectedReview.orderItem?.packSize ?? "-"}</span>
                </p>
              </div>

              <label className="block">
                <span className="admin-label">Moderation note</span>
                <textarea
                  rows={4}
                  value={moderationNote}
                  onChange={(event) => setModerationNote(event.target.value)}
                  className="admin-input min-h-[120px]"
                  placeholder="Optional note for internal moderation or customer guidance."
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => moderate("approved")}
                  className="btn-primary"
                >
                  {saving ? "Saving..." : "Approve review"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => moderate("rejected")}
                  className="btn-secondary"
                >
                  Reject review
                </button>
                {selectedReview.status !== "pending" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => moderate("pending")}
                    className="btn-ghost"
                  >
                    Move back to pending
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
