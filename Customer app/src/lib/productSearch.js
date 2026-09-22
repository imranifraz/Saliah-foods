/**
 * Client-side product search helpers for header + listing filters.
 */

function haystack(product) {
  return [
    product.name,
    product.tagline,
    product.categoryLabel,
    product.slug,
    product.tag,
    product.badge,
    Array.isArray(product.benefits) ? product.benefits.join(" ") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesProductSearch(product, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return true;
  return haystack(product).includes(q);
}

/** Rank matches: name prefix > name includes > other fields. */
export function rankProductSearch(products, query, limit = 8) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const product of products) {
    const name = String(product.name ?? "").toLowerCase();
    const slug = String(product.slug ?? "").toLowerCase();
    const rest = haystack(product);

    if (!rest.includes(q)) continue;

    let score = 1;
    if (name.startsWith(q) || slug.startsWith(q)) score = 100;
    else if (name.includes(q) || slug.includes(q)) score = 50;
    else if ((product.categoryLabel ?? "").toLowerCase().includes(q)) score = 25;

    scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  return scored.slice(0, limit).map((row) => row.product);
}
