import { useEffect, useMemo, useState } from "react";
import { fetchProductReviewsApi } from "../../services/productReviewApi.js";

const STAR_FILTERS = [
  { id: "all", label: "All" },
  { id: "5", label: "5★" },
  { id: "4", label: "4★" },
  { id: "3", label: "3★" },
  { id: "2", label: "2★" },
  { id: "1", label: "1★" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Most recent" },
  { id: "positive", label: "Positive first" },
  { id: "critical", label: "Critical first" },
];

const INITIAL_REVIEW_COUNT = 3;
const REVIEW_LOAD_STEP = 5;

function StarRating({ rating, size = "md" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const icon = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${icon} ${i < full ? "text-gold-500" : i === full && half ? "text-gold-400" : "text-cream-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatReviewDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function sortReviews(reviews, sort) {
  const list = [...reviews];
  if (sort === "positive") {
    return list.sort((a, b) => b.rating - a.rating || new Date(b.submittedAt) - new Date(a.submittedAt));
  }
  if (sort === "critical") {
    return list.sort((a, b) => a.rating - b.rating || new Date(b.submittedAt) - new Date(a.submittedAt));
  }
  return list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function ProductDetailReviewsSection({ productSlug, fallbackRating = 0, fallbackCount = 0 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [starFilter, setStarFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(INITIAL_REVIEW_COUNT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setVisibleCount(INITIAL_REVIEW_COUNT);
    setStarFilter("all");

    fetchProductReviewsApi(productSlug)
      .then((data) => {
        if (cancelled) return;
        setSummary(data.summary ?? null);
        setReviews(data.reviews ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Could not load reviews");
        setReviews([]);
        setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const average = summary?.average ?? fallbackRating;
  const totalCount = summary?.count ?? fallbackCount;
  const distribution = summary?.distribution ?? [];

  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (starFilter !== "all") {
      const star = Number(starFilter);
      list = list.filter((review) => Math.round(review.rating) === star);
    }
    return sortReviews(list, sort);
  }, [reviews, starFilter, sort]);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredReviews.length - visibleCount);
  const canLoadMore = remainingCount > 0;

  return (
    <section className="pdp-reviews" aria-labelledby="pdp-reviews-title">
      <div className="pdp-reviews__head">
        <h2 id="pdp-reviews-title" className="pdp-reviews__title">
          Ratings &amp; reviews
        </h2>
        <p className="pdp-reviews__subtitle">Verified buyers after delivery</p>
      </div>

      {loading ? (
        <p className="pdp-reviews__loading">Loading reviews…</p>
      ) : error ? (
        <p className="pdp-reviews__error">{error}</p>
      ) : totalCount === 0 ? (
        <div className="pdp-reviews__empty">
          <p className="font-display text-lg text-emerald-900">No reviews yet</p>
          <p className="mt-1 font-body text-sm text-emerald-900/50">
            Be the first to rate this product after your order is delivered.
          </p>
        </div>
      ) : (
        <div className="pdp-reviews__layout">
          <aside className="pdp-reviews__summary">
            <div className="pdp-reviews__score-row">
              <span className="pdp-reviews__score">{average.toFixed(1)}</span>
              <div>
                <StarRating rating={average} size="lg" />
                <p className="pdp-reviews__count">
                  {totalCount.toLocaleString("en-IN")} rating{totalCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <ul className="pdp-reviews__bars" aria-label="Rating breakdown">
              {distribution.map((row) => (
                <li key={row.star} className="pdp-reviews__bar-row">
                  <span className="pdp-reviews__bar-label">
                    {row.star}
                    <span className="sr-only"> star</span>
                  </span>
                  <div className="pdp-reviews__bar-track">
                    <span
                      className="pdp-reviews__bar-fill"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="pdp-reviews__bar-pct">{row.percent}%</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="pdp-reviews__main">
            <div className="pdp-reviews__filters">
              <div className="pdp-reviews__filter-group" role="tablist" aria-label="Filter by rating">
                {STAR_FILTERS.map((option) => {
                  const count =
                    option.id === "all"
                      ? reviews.length
                      : reviews.filter((r) => Math.round(r.rating) === Number(option.id)).length;
                  if (option.id !== "all" && count === 0) return null;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="tab"
                      aria-selected={starFilter === option.id}
                      className={`pdp-reviews__chip ${starFilter === option.id ? "pdp-reviews__chip--active" : ""}`}
                      onClick={() => {
                        setStarFilter(option.id);
                        setVisibleCount(INITIAL_REVIEW_COUNT);
                      }}
                    >
                      {option.label}
                      <span className="pdp-reviews__chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <label className="pdp-reviews__sort">
                <span className="sr-only">Sort reviews</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setVisibleCount(INITIAL_REVIEW_COUNT);
                  }}
                  className="pdp-reviews__sort-select"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filteredReviews.length === 0 ? (
              <p className="pdp-reviews__no-match font-body text-sm text-emerald-900/50">
                No reviews match this filter.
              </p>
            ) : (
              <ul className="pdp-reviews__list">
                {visibleReviews.map((review) => (
                  <li key={review.id}>
                    <article className="pdp-review-card">
                      <div className="pdp-review-card__top">
                        <div className="pdp-review-card__stars">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="pdp-review-card__rating-num">{review.rating}</span>
                        </div>
                        <span className="pdp-review-card__verified">Verified purchase</span>
                      </div>

                      {review.title ? (
                        <h3 className="pdp-review-card__title">{review.title}</h3>
                      ) : null}

                      <p className="pdp-review-card__comment">{review.comment}</p>

                      <footer className="pdp-review-card__footer">
                        <span className="pdp-review-card__author">{review.customerName}</span>
                        <span className="pdp-review-card__dot" aria-hidden>
                          ·
                        </span>
                        <time className="pdp-review-card__date" dateTime={review.submittedAt}>
                          {formatReviewDate(review.submittedAt)}
                        </time>
                      </footer>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            {canLoadMore ? (
              <button
                type="button"
                className="pdp-reviews__more"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + REVIEW_LOAD_STEP, filteredReviews.length)
                  )
                }
              >
                Load more reviews ({remainingCount} remaining)
              </button>
            ) : null}

            {visibleCount > INITIAL_REVIEW_COUNT && filteredReviews.length > INITIAL_REVIEW_COUNT ? (
              <button
                type="button"
                className="pdp-reviews__more pdp-reviews__more--muted"
                onClick={() => setVisibleCount(INITIAL_REVIEW_COUNT)}
              >
                Show fewer reviews
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
