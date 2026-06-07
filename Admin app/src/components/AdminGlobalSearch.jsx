import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";

function IconSearch() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconClear() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchSection({ title, items, onNavigate }) {
  if (!items?.length) return null;

  return (
    <div className="border-b border-[var(--admin-border)] last:border-b-0">
      <p className="admin-caption px-4 py-2">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item.id}`}>
            <Link
              to={item.href}
              role="option"
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--admin-hover)]"
              onClick={onNavigate}
            >
              <span className="truncate font-medium text-[var(--admin-fg)]">{item.label}</span>
              {item.status ? (
                <span className="admin-muted shrink-0 text-xs capitalize">{item.status}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminGlobalSearch() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ categories: [], products: [], orders: [], inventory: [] });

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const term = query.trim();

    if (!term) {
      setResults({ categories: [], products: [], orders: [], inventory: [] });
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      apiFetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
        .then((data) => {
          setResults({
            categories: data.categories ?? [],
            products: (data.products ?? []).map((product) => ({
              ...product,
              href: `/products?q=${encodeURIComponent(product.label)}`,
            })),
            orders: data.orders ?? [],
            inventory: data.inventory ?? [],
          });
        })
        .catch(() => {
          setResults({ categories: [], products: [], orders: [], inventory: [] });
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const trimmed = query.trim();
  const hasResults =
    results.categories.length > 0 ||
    results.products.length > 0 ||
    results.orders.length > 0 ||
    results.inventory.length > 0;

  function closePanel() {
    setOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/categories?q=${encodeURIComponent(trimmed)}`);
  }

  function clearSearch() {
    setQuery("");
    setResults({ categories: [], products: [], orders: [], inventory: [] });
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-md shrink-0" ref={rootRef}>
      <form onSubmit={handleSubmit}>
        <div className="admin-search flex h-10 w-full items-center gap-0.5 rounded-full border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)] pl-1 pr-1 transition focus-within:border-[color-mix(in_srgb,var(--admin-accent)_55%,transparent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--admin-accent)_18%,transparent)]">
          <button
            type="submit"
            className="shrink-0 rounded-full p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
            aria-label="Search"
          >
            <IconSearch />
          </button>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={open && Boolean(trimmed)}
            aria-controls="admin-global-search-results"
            aria-autocomplete="list"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (trimmed) setOpen(true);
            }}
            placeholder="Search categories, products, SKUs, orders…"
            aria-label="Search categories, products, SKUs, and orders"
            className="min-w-0 flex-1 border-0 bg-transparent py-0 pr-1 text-sm text-[var(--admin-fg)] outline-none placeholder:font-normal placeholder:text-[var(--admin-fg-faint)]"
          />
          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="shrink-0 rounded-full p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
              aria-label="Clear search"
            >
              <IconClear />
            </button>
          ) : null}
        </div>
      </form>

      {open && trimmed ? (
        <div
          id="admin-global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl"
        >
          {loading ? (
            <p className="admin-muted px-4 py-3 text-sm">Searching…</p>
          ) : hasResults ? (
            <>
              <SearchSection title="Categories" items={results.categories} onNavigate={closePanel} />
              <SearchSection title="Products" items={results.products} onNavigate={closePanel} />
              <SearchSection title="Inventory" items={results.inventory} onNavigate={closePanel} />
              <SearchSection title="Orders" items={results.orders} onNavigate={closePanel} />
            </>
          ) : (
            <p className="admin-muted px-4 py-3 text-sm">No matches for “{trimmed}”.</p>
          )}
          {results.inventory.length > 0 ? (
            <button
              type="button"
              className="flex w-full items-center justify-between border-t border-[var(--admin-border)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--admin-link)] transition hover:bg-[var(--admin-hover)]"
              onClick={() => {
                closePanel();
                navigate(`/inventory?q=${encodeURIComponent(trimmed)}`);
              }}
            >
              View all inventory results
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center justify-between border-t border-[var(--admin-border)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--admin-link)] transition hover:bg-[var(--admin-hover)]"
              onClick={() => {
                closePanel();
                navigate(`/categories?q=${encodeURIComponent(trimmed)}`);
              }}
            >
              View all category results
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
