import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { OptimizedImage } from "../ui/OptimizedImage";
import { ProductPrice } from "../ui/ProductPrice";
import {
  AccountBtn,
  AccountCard,
  AccountEmptyState,
  AccountSectionHeader,
} from "./AccountUI";

function StarRow({ rating = 4.8 }) {
  const full = Math.floor(rating);

  return (
    <div className="wishlist-row__rating" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-px" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`h-3 w-3 ${i < full ? "text-gold-500" : "text-cream-200"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-body text-[11px] font-medium text-emerald-900/50">{rating.toFixed(1)}</span>
      <span className="text-emerald-900/20" aria-hidden>
        ·
      </span>
      <span className="wishlist-row__stock">In stock</span>
    </div>
  );
}

function WishlistRow({ item, onAddToCart, onRemove }) {
  const href = `/product/${item.slug}`;

  return (
    <article className="wishlist-row">
      <Link to={href} className="wishlist-row__thumb" aria-label={`View ${item.name}`}>
        <OptimizedImage
          src={item.img}
          alt=""
          className="max-h-[88%] max-w-[88%] object-contain"
          width={96}
          height={96}
        />
      </Link>

      <div className="wishlist-row__body">
        <div className="wishlist-row__details">
          <div className="min-w-0">
            <Link to={href} className="wishlist-row__title">
              {item.name}
            </Link>
            {item.packSize ? (
              <p className="wishlist-row__pack">{item.packSize}</p>
            ) : null}
          </div>

          <StarRow />

          <ProductPrice
            priceValue={item.priceValue}
            mrpValue={item.mrpValue}
            price={item.price}
            mrp={item.mrp}
            discountPercent={item.discountPercent}
            size="sm"
            className="wishlist-row__price"
          />
        </div>

        <div className="wishlist-row__actions">
          <AccountBtn variant="primary" className="account-btn--sm wishlist-row__cta" onClick={onAddToCart}>
            Add to cart
          </AccountBtn>
          <Link to={href} className="account-btn account-btn--ghost account-btn--sm wishlist-row__cta">
            View product
          </Link>
          <button type="button" className="wishlist-row__remove" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

export function AccountWishlistSection() {
  const { items, loading, error, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [actionError, setActionError] = useState("");

  const handleRemove = async (item) => {
    setActionError("");
    try {
      await removeFromWishlist(item.variantId ?? null, item.slug, item.packSize);
    } catch (err) {
      setActionError(err.message ?? "Could not remove item");
    }
  };

  if (loading && items.length === 0) {
    return (
      <div>
        <AccountSectionHeader
          title="Wishlist"
          description="Curate the dates, honey, and preserves you love for later."
        />
        <AccountCard>
          <p className="font-body text-sm text-emerald-900/50">Loading wishlist…</p>
        </AccountCard>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div>
        <AccountSectionHeader
          title="Wishlist"
          description="Curate the dates, honey, and preserves you love for later."
        />
        {error ? (
          <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 font-body text-sm text-amber-900/80">
            {error}
          </p>
        ) : null}
        <AccountCard>
          <AccountEmptyState
            icon="♡"
            title="Your wishlist is empty"
            description="Explore our premium collection and save favourites to shop when you are ready."
            actionLabel="Continue shopping"
            actionHref="/products/all"
          />
        </AccountCard>
      </div>
    );
  }

  return (
    <div className="account-wishlist-section">
      <AccountSectionHeader
        title="Wishlist"
        description={`${items.length} saved item${items.length !== 1 ? "s" : ""}`}
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 font-body text-sm text-amber-900/80">
          {error}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700/85">
          {actionError}
        </p>
      ) : null}

      <ul className="account-wishlist-list" role="list">
        {items.map((item) => (
          <li key={item.variantId ?? `${item.slug}::${item.packSize}`}>
            <WishlistRow
              item={item}
              onAddToCart={() =>
                addItem({
                  productId: item.productId ?? null,
                  variantId: item.variantId ?? null,
                  sku: item.sku ?? null,
                  slug: item.slug,
                  name: item.name,
                  img: item.img,
                  price: item.price,
                  priceValue: item.priceValue,
                  mrp: item.mrp,
                  mrpValue: item.mrpValue,
                  packSize: item.packSize ?? "",
                })
              }
              onRemove={() => handleRemove(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
