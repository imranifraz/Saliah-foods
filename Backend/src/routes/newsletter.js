import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../lib/notifications.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const newsletterRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many subscription attempts. Please try again later." },
});

router.post("/", newsletterRateLimit, async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const source = String(req.body.source ?? "website").trim().slice(0, 40) || "website";

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.status === "active") {
      return res.json({
        ok: true,
        alreadySubscribed: true,
        message: "You are already subscribed to the Saliah Foods newsletter.",
      });
    }

    const subscriber = await prisma.$transaction(async (tx) => {
      const row = existing
        ? await tx.newsletterSubscriber.update({
            where: { email },
            data: {
              status: "active",
              source,
              unsubscribedAt: null,
            },
          })
        : await tx.newsletterSubscriber.create({
            data: { email, source, status: "active" },
          });

      if (!existing || existing.status !== "active") {
        await createNotification(tx, {
          audience: "admin",
          type: "newsletter_subscribe",
          category: "newsletter",
          title: existing ? "Newsletter re-subscribed" : "New newsletter subscriber",
          message: `${email} joined via ${source}.`,
          actionLabel: "View subscribers",
          actionHref: "/cms/newsletter",
        });
      }

      return row;
    });

    res.status(existing ? 200 : 201).json({
      ok: true,
      alreadySubscribed: false,
      message: "Thank you for subscribing. Welcome to the Saliah Foods newsletter.",
      id: subscriber.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
