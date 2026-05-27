import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatReview, syncProductReviewAggregates } from "../../lib/reviews.js";
import { notifyReviewModerated } from "../../lib/notifications.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);

function formatAdminReview(review) {
  return {
    ...formatReview(review),
    customer: review.user
      ? {
          id: review.user.id,
          fullName: review.user.fullName,
          email: review.user.email,
        }
      : null,
    product: review.product
      ? {
          id: review.product.id,
          slug: review.product.slug,
          name: review.product.name,
          categoryLabel: review.product.categoryLabel,
        }
      : null,
    order: review.order
      ? {
          id: review.order.id,
          status: review.order.status,
          createdAt: review.order.createdAt?.toISOString?.() ?? review.order.createdAt,
        }
      : null,
    orderItem: review.orderItem
      ? {
          id: review.orderItem.id,
          name: review.orderItem.name,
          packSize: review.orderItem.packSize,
          quantity: review.orderItem.quantity,
        }
      : null,
  };
}

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const status = String(req.query.status ?? "pending");
    const where =
      status === "all"
        ? {}
        : REVIEW_STATUSES.has(status)
          ? { status }
          : { status: "pending" };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryLabel: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        orderItem: {
          select: {
            id: true,
            name: true,
            packSize: true,
            quantity: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    });

    res.json({ ok: true, reviews: reviews.map(formatAdminReview) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const status = String(req.body.status ?? "").trim();
    const moderationNote = String(req.body.moderationNote ?? "").trim();

    if (!REVIEW_STATUSES.has(status)) {
      return res.status(400).json({ ok: false, error: "Invalid review status" });
    }

    const existing = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ ok: false, error: "Review not found" });
    }

    const moderatedAt = status === "pending" ? null : new Date();
    const review = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: existing.id },
        data: {
          status,
          moderationNote: moderationNote || null,
          moderatedAt,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryLabel: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
          orderItem: {
            select: {
              id: true,
              name: true,
              packSize: true,
              quantity: true,
            },
          },
        },
      });

      await syncProductReviewAggregates(tx, existing.productId);
      if (status !== existing.status && status !== "pending") {
        const productName = updated.orderItem?.name ?? updated.product?.name ?? "a product";
        await notifyReviewModerated(tx, updated, productName);
      }
      return updated;
    });

    res.json({ ok: true, review: formatAdminReview(review) });
  } catch (err) {
    next(err);
  }
});

export default router;
