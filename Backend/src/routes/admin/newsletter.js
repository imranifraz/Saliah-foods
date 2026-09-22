import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function formatSubscriber(row) {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    status: row.status,
    unsubscribedAt: row.unsubscribedAt ? row.unsubscribedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

router.get("/", async (req, res, next) => {
  try {
    const status = String(req.query.status ?? "all").trim();
    const q = String(req.query.q ?? "").trim().toLowerCase();

    const where = {};
    if (status === "active" || status === "unsubscribed") {
      where.status = status;
    }
    if (q) {
      where.email = { contains: q, mode: "insensitive" };
    }

    const [rows, activeCount, unsubscribedCount, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.newsletterSubscriber.count({ where: { status: "active" } }),
      prisma.newsletterSubscriber.count({ where: { status: "unsubscribed" } }),
      prisma.newsletterSubscriber.count(),
    ]);

    res.json({
      ok: true,
      subscribers: rows.map(formatSubscriber),
      summary: {
        total,
        active: activeCount,
        unsubscribed: unsubscribedCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/export", async (req, res, next) => {
  try {
    const status = String(req.query.status ?? "active").trim();
    const where =
      status === "all"
        ? undefined
        : status === "unsubscribed"
          ? { status: "unsubscribed" }
          : { status: "active" };

    const rows = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const header = ["email", "status", "source", "subscribedAt", "unsubscribedAt"];
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          escapeCsv(row.email),
          escapeCsv(row.status),
          escapeCsv(row.source),
          escapeCsv(row.createdAt.toISOString()),
          escapeCsv(row.unsubscribedAt ? row.unsubscribedAt.toISOString() : ""),
        ].join(",")
      ),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="newsletter-${status}-${stamp}.csv"`);
    res.send(lines.join("\n"));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const nextStatus = String(req.body.status ?? "").trim();
    if (nextStatus !== "active" && nextStatus !== "unsubscribed") {
      return res.status(400).json({ ok: false, error: "Status must be active or unsubscribed" });
    }

    const row = await prisma.newsletterSubscriber.update({
      where: { id: req.params.id },
      data: {
        status: nextStatus,
        unsubscribedAt: nextStatus === "unsubscribed" ? new Date() : null,
      },
    });

    res.json({ ok: true, subscriber: formatSubscriber(row) });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Subscriber not found" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Subscriber not found" });
    }
    next(err);
  }
});

export default router;
