import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

function IconHeart({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function WishlistButton({ product, className = "", size = "md" }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product);

  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleWishlist(product);
    if (result.needsAuth) {
      navigate("/login", { state: { from: window.location.pathname } });
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full border border-cream-200/90 bg-white/95 text-emerald-900/45 shadow-sm transition-colors hover:border-gold-400/40 hover:text-gold-600 ${saved ? "border-gold-400/50 text-gold-600" : ""} ${className}`}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={handleClick}
    >
      <IconHeart filled={saved} />
    </button>
  );
}
