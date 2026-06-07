import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";
import { isEmailTaken } from "../../lib/emailAvailability.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatUser(user, counts = {}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: "customer",
    provider: user.provider ?? "local",
    dateOfBirth: user.dateOfBirth ?? "",
    profileNote: user.profileNote ?? "",
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    orderCount: counts.orderCount ?? 0,
    addressCount: counts.addressCount ?? 0,
    wishlistCount: counts.wishlistCount ?? 0,
  };
}

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    const where = {};

    if (q?.trim()) {
      const search = q.trim();
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true, addresses: true, wishlistItems: true } },
      },
    });

    res.json({
      ok: true,
      users: users.map((u) =>
        formatUser(u, {
          orderCount: u._count.orders,
          addressCount: u._count.addresses,
          wishlistCount: u._count.wishlistItems,
        })
      ),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { orders: true, addresses: true, wishlistItems: true } },
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const { orders, _count, ...rest } = user;
    res.json({
      ok: true,
      user: formatUser(rest, {
        orderCount: _count.orders,
        addressCount: _count.addresses,
        wishlistCount: _count.wishlistItems,
      }),
      recentOrders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({ ok: false, error: "Name and email are required" });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ ok: false, error: "Invalid email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await isEmailTaken(normalizedEmail)) {
      return res.status(409).json({ ok: false, error: "Email already registered" });
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() ?? "",
        passwordHash,
        provider: "local",
      },
      include: {
        _count: { select: { orders: true, addresses: true, wishlistItems: true } },
      },
    });

    await prisma.notificationPrefs.create({ data: { userId: user.id } });

    res.status(201).json({
      ok: true,
      user: formatUser(user, {
        orderCount: user._count.orders,
        addressCount: user._count.addresses,
        wishlistCount: user._count.wishlistItems,
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "User not found" });

    const { fullName, phone, profileNote } = req.body;
    const data = {};

    if (fullName !== undefined) data.fullName = fullName.trim();
    if (phone !== undefined) data.phone = phone.trim();
    if (profileNote !== undefined) data.profileNote = profileNote.trim();

    const user = await prisma.user.update({
      where: { id: existing.id },
      data,
      include: {
        _count: { select: { orders: true, addresses: true, wishlistItems: true } },
      },
    });

    res.json({
      ok: true,
      user: formatUser(user, {
        orderCount: user._count.orders,
        addressCount: user._count.addresses,
        wishlistCount: user._count.wishlistItems,
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "User not found" });

    await prisma.user.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
