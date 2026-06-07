import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    res.json({ ok: true, addresses });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const count = await prisma.address.count({ where: { userId: req.user.id } });
    const isDefault = count === 0 ? true : Boolean(data.isDefault);

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: data.label,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? "",
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country?.trim() || "India",
        isDefault,
      },
    });

    res.status(201).json({ ok: true, address });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/default", async (req, res, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ ok: false, error: "Address not found" });

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: existing.id },
        data: { isDefault: true },
      }),
    ]);

    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json({ ok: true, addresses });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ ok: false, error: "Address not found" });

    const address = await prisma.address.update({
      where: { id: existing.id },
      data: {
        label: req.body.label ?? existing.label,
        fullName: req.body.fullName ?? existing.fullName,
        email: req.body.email ?? existing.email,
        phone: req.body.phone ?? existing.phone,
        addressLine1: req.body.addressLine1 ?? existing.addressLine1,
        addressLine2: req.body.addressLine2 ?? existing.addressLine2,
        city: req.body.city ?? existing.city,
        state: req.body.state ?? existing.state,
        pincode: req.body.pincode ?? existing.pincode,
        country: req.body.country?.trim() || existing.country || "India",
      },
    });

    res.json({ ok: true, address });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ ok: false, error: "Address not found" });

    await prisma.address.delete({ where: { id: existing.id } });

    const remaining = await prisma.address.findMany({ where: { userId: req.user.id } });
    if (remaining.length && !remaining.some((a) => a.isDefault)) {
      await prisma.address.update({
        where: { id: remaining[0].id },
        data: { isDefault: true },
      });
    }

    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json({ ok: true, addresses });
  } catch (err) {
    next(err);
  }
});

export default router;
