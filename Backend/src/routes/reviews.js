import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { formatReview, formatReviewableOrderItem } from "../lib/reviews.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function parseRating(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }
  return parsed;
}

router.use(requireAuth);

router.get("/mine", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, status: "delivered" },
      include: {
        items: {
          include: {
            review: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = orders.flatMap((order) =>
      order.items
        .filter((item) => item.productId)
        .map((item) => formatReviewableOrderItem(order, item))
    );

    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const orderItemId = String(req.body.orderItemId ?? "").trim();
    const rating = parseRating(req.body.rating);
    const title = String(req.body.title ?? "").trim().slice(0, 120);
    const comment = String(req.body.comment ?? "").trim();

    if (!orderItemId) {
      return res.status(400).json({ ok: false, error: "Order item is required" });
    }

    if (rating == null) {
      return res.status(400).json({ ok: false, error: "Rating must be between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ ok: false, error: "Review comment is required" });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        review: true,
      },
    });

    if (!orderItem || orderItem.order?.userId !== req.user.id) {
      return res.status(404).json({ ok: false, error: "Delivered order item not found" });
    }

    if (orderItem.order.status !== "delivered") {
      return res.status(400).json({ ok: false, error: "You can review products only after delivery" });
    }

    if (!orderItem.productId) {
      return res.status(400).json({ ok: false, error: "This order item cannot be reviewed yet" });
    }

    if (orderItem.review?.status === "approved") {
      return res.status(400).json({ ok: false, error: "Approved reviews cannot be edited right now" });
    }

    const submittedAt = new Date();
    const saved = await prisma.$transaction(async (tx) => {
      if (orderItem.review) {
        return tx.review.update({
          where: { id: orderItem.review.id },
          data: {
            rating,
            title,
            comment,
            status: "pending",
            moderationNote: null,
            moderatedAt: null,
            submittedAt,
          },
        });
      }

      return tx.review.create({
        data: {
          userId: req.user.id,
          orderId: orderItem.orderId,
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          variantId: orderItem.variantId ?? null,
          rating,
          title,
          comment,
          submittedAt,
        },
      });
    });

    res.status(201).json({ ok: true, review: formatReview(saved) });
  } catch (err) {
    next(err);
  }
});

export default router;
