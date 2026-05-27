import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function parseISODate(value) {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isFinite(d.getTime()) ? d : null;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1);
}

function addDays(d, days) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(d, months) {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatBucketKey(date, groupBy) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (groupBy === "year") return `${y}`;
  if (groupBy === "month") return `${y}-${m}`;
  return `${y}-${m}-${day}`;
}

function nextBucketStart(date, groupBy) {
  if (groupBy === "year") return new Date(date.getFullYear() + 1, 0, 1);
  if (groupBy === "month") return addMonths(new Date(date.getFullYear(), date.getMonth(), 1), 1);
  return addDays(startOfDay(date), 1);
}

function coerceGroupBy(value) {
  const v = String(value ?? "day").toLowerCase();
  if (v === "day" || v === "month" || v === "year") return v;
  return "day";
}

function coerceRange(value) {
  const v = String(value ?? "month").toLowerCase();
  if (v === "day" || v === "month" || v === "year" || v === "all") return v;
  return "month";
}

function safeNumber(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x : 0;
}

router.get("/", async (req, res, next) => {
  try {
    const now = new Date();
    const range = coerceRange(req.query.range);
    const groupBy = coerceGroupBy(req.query.groupBy);

    const fromParam = parseISODate(req.query.from);
    const toParam = parseISODate(req.query.to);

    let from =
      fromParam ??
      (range === "day"
        ? startOfDay(now)
        : range === "month"
          ? startOfMonth(now)
          : range === "year"
            ? startOfYear(now)
            : new Date(0));
    let to = toParam ?? now;

    if (from > to) {
      const tmp = from;
      from = to;
      to = tmp;
    }

    // Only count non-cancelled orders as sales by default.
    const where = { createdAt: { gte: from, lte: to }, status: { not: "cancelled" } };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { items: true },
    });

    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + safeNumber(o.total), 0);

    // Build time series buckets (fills empty buckets).
    const buckets = new Map();
    for (const order of orders) {
      const key = formatBucketKey(order.createdAt, groupBy);
      const current = buckets.get(key) ?? { key, orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += safeNumber(order.total);
      buckets.set(key, current);
    }

    const series = [];
    // Fill contiguous buckets from "from" to "to".
    let cursor =
      groupBy === "year"
        ? startOfYear(from)
        : groupBy === "month"
          ? startOfMonth(from)
          : startOfDay(from);
    const end = to;
    while (cursor <= end) {
      const key = formatBucketKey(cursor, groupBy);
      const value = buckets.get(key) ?? { key, orders: 0, revenue: 0 };
      series.push(value);
      cursor = nextBucketStart(cursor, groupBy);
    }

    // Best sellers (by qty + by revenue) from OrderItem snapshots.
    const productAgg = new Map();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const id = item.productId ?? item.variantId ?? item.sku ?? item.productSlug ?? item.name;
        const qty = safeNumber(item.quantity);
        const lineRevenue = safeNumber(item.priceValue) * qty;
        const current = productAgg.get(id) ?? {
          id,
          name: item.name,
          slug: item.productSlug,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += qty;
        current.revenue += lineRevenue;
        // keep latest seen
        current.name = item.name ?? current.name;
        current.slug = item.productSlug ?? current.slug;
        productAgg.set(id, current);
      }
    }

    const bestSellers = [...productAgg.values()]
      .sort((a, b) => (b.quantity - a.quantity) || (b.revenue - a.revenue))
      .slice(0, 10);

    res.json({
      ok: true,
      range,
      groupBy,
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        orders: totalOrders,
        revenue,
        aov: totalOrders ? Math.round(revenue / totalOrders) : 0,
      },
      series,
      bestSellers,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

