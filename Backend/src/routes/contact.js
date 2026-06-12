import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../lib/notifications.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many messages sent. Please try again later." },
});

router.post("/", contactRateLimit, async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const phone = String(req.body.phone ?? "").trim();
    const subject = String(req.body.subject ?? "").trim();
    const message = String(req.body.message ?? "").trim();

    if (!name) {
      return res.status(400).json({ ok: false, error: "Name is required" });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }
    if (!subject) {
      return res.status(400).json({ ok: false, error: "Subject is required" });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ ok: false, error: "Message must be at least 10 characters" });
    }

    const enquiry = await prisma.$transaction(async (tx) => {
      const row = await tx.contactMessage.create({
        data: { name, email, phone, subject, message },
      });

      await createNotification(tx, {
        audience: "admin",
        type: "contact_enquiry",
        category: "contact",
        title: "New contact enquiry",
        message: `${name} — ${subject}`,
        actionLabel: "View enquiry",
        actionHref: "/cms/enquiries",
      });

      return row;
    });

    res.status(201).json({
      ok: true,
      message: "Thank you. We have received your message.",
      id: enquiry.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
