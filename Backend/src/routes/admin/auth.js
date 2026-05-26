import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { signToken, toSessionUser } from "../../lib/auth.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/login", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }
    if (!password) {
      return res.status(400).json({ ok: false, error: "Password is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, phone: true, role: true, passwordHash: true, dateOfBirth: true, profileNote: true, provider: true },
    });

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isAdmin = user?.role === "admin" || (adminEmail && email === adminEmail);
    if (!user?.passwordHash || !isAdmin) {
      return res.status(401).json({ ok: false, error: "Invalid admin credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid admin credentials" });
    }

    const token = signToken(user.id);
    res.json({ ok: true, token, user: toSessionUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
