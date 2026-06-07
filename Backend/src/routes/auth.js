import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken, toSessionUser } from "../lib/auth.js";
import { isEmailTaken } from "../lib/emailAvailability.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  return errors;
}

function validateRegister({ fullName, email, phone, password, confirmPassword }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = "Full name is required";
  if (!email?.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  if (!phone?.trim()) errors.phone = "Phone number is required";
  else if (!PHONE_RE.test(phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit mobile number";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

router.post("/register", async (req, res, next) => {
  try {
    const errors = validateRegister(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

    const email = req.body.email.trim().toLowerCase();
    if (await isEmailTaken(email)) {
      return res.status(409).json({ ok: false, error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: req.body.fullName.trim(),
        email,
        phone: req.body.phone.trim(),
        passwordHash,
        provider: "local",
      },
    });

    await prisma.notificationPrefs.create({ data: { userId: user.id } });

    const token = signToken(user.id);
    res.status(201).json({ ok: true, token, user: toSessionUser(user), hasPassword: true });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

    const email = req.body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    res.json({ ok: true, token, user: toSessionUser(user), hasPassword: true });
  } catch (err) {
    next(err);
  }
});

router.post("/social", async (req, res, next) => {
  try {
    const { provider, fullName, email, phone, providerId } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ ok: false, error: "Email permission is required to sign in." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      if (await isEmailTaken(normalizedEmail)) {
        return res.status(409).json({
          ok: false,
          error: "This email is registered as an admin account. Use a different email for the storefront.",
        });
      }

      user = await prisma.user.create({
        data: {
          fullName: (fullName ?? "User").trim(),
          email: normalizedEmail,
          phone: phone?.trim() ?? "",
          provider,
          providerId: providerId ?? null,
        },
      });
      await prisma.notificationPrefs.create({ data: { userId: user.id } });
    }

    const token = signToken(user.id);
    res.json({
      ok: true,
      token,
      user: toSessionUser(user),
      hasPassword: Boolean(user.passwordHash),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: toSessionUser(req.user), hasPassword: Boolean(req.user.passwordHash) });
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const { fullName, email, phone, dateOfBirth, profileNote } = req.body;
    const nextEmail = email?.trim().toLowerCase();

    if (nextEmail) {
      if (await isEmailTaken(nextEmail, { excludeUserId: req.user.id })) {
        return res.status(409).json({ ok: false, error: "Another account uses this email" });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName?.trim() ?? req.user.fullName,
        email: nextEmail ?? req.user.email,
        phone: phone?.trim() ?? req.user.phone,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : req.user.dateOfBirth,
        profileNote: profileNote !== undefined ? (profileNote?.trim() ?? "") : req.user.profileNote,
      },
    });

    res.json({ ok: true, user: toSessionUser(updated) });
  } catch (err) {
    next(err);
  }
});

router.patch("/password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ ok: false, error: "New password must be at least 6 characters" });
    }

    if (req.user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ ok: false, error: "Current password is required" });
      }
      const valid = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!valid) {
        return res.status(400).json({ ok: false, error: "Current password is incorrect" });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/account", requireAuth, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
