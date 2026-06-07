import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";
import { isEmailTaken } from "../../lib/emailAvailability.js";
import { validatePasswordStrength } from "../../lib/passwordPolicy.js";
import { invalidateAdminSessions } from "../../lib/adminRefreshToken.js";
import { validateIndianPhone } from "../../lib/phone.js";
import { deleteAdminAvatarFile } from "../../lib/adminAvatarFiles.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const avatarUploadDir = path.resolve(process.cwd(), "uploads", "admins");
fs.mkdirSync(avatarUploadDir, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      cb(null, `admin-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

function formatAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone,
    role: "admin",
    profileNote: admin.profileNote ?? "",
    avatarUrl: admin.avatarUrl ?? "",
    hasPassword: Boolean(admin.passwordHash),
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

router.use(requireAdmin);

router.post("/upload-avatar", avatarUpload.single("image"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Image file is required" });
    }
    res.status(201).json({
      ok: true,
      url: `/uploads/admins/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    const where = {};
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 25));
    const skip = (page - 1) * pageSize;

    if (q?.trim()) {
      const search = q.trim();
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.admin.count({ where }),
    ]);

    res.json({
      ok: true,
      admins: admins.map(formatAdmin),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.params.id },
    });

    if (!admin) return res.status(404).json({ ok: false, error: "Admin not found" });

    res.json({ ok: true, admin: formatAdmin(admin) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone, password, avatarUrl } = req.body;

    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({ ok: false, error: "Name and email are required" });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ ok: false, error: "Invalid email address" });
    }

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.ok) {
      return res.status(400).json({ ok: false, error: phoneCheck.error });
    }

    const policy = validatePasswordStrength(password);
    if (!policy.ok) {
      return res.status(400).json({ ok: false, error: policy.error });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await isEmailTaken(normalizedEmail)) {
      return res.status(409).json({ ok: false, error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phoneCheck.normalized,
        passwordHash,
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl.trim() : "",
      },
    });

    res.status(201).json({ ok: true, admin: formatAdmin(admin) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "Admin not found" });

    const { fullName, phone, profileNote, email, avatarUrl } = req.body;
    const data = {};

    if (fullName !== undefined) data.fullName = fullName.trim();
    if (profileNote !== undefined) data.profileNote = profileNote.trim();

    if (phone !== undefined) {
      const phoneCheck = validateIndianPhone(phone);
      if (!phoneCheck.ok) {
        return res.status(400).json({ ok: false, error: phoneCheck.error });
      }
      data.phone = phoneCheck.normalized;
    }

    if (avatarUrl !== undefined) {
      const nextAvatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
      data.avatarUrl = nextAvatarUrl;

      const previousAvatarUrl = existing.avatarUrl ?? "";
      if (previousAvatarUrl && previousAvatarUrl !== nextAvatarUrl) {
        await deleteAdminAvatarFile(previousAvatarUrl);
      }
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_RE.test(normalizedEmail)) {
        return res.status(400).json({ ok: false, error: "Invalid email address" });
      }
      if (await isEmailTaken(normalizedEmail, { excludeAdminId: existing.id })) {
        return res.status(409).json({ ok: false, error: "Email already registered" });
      }
      data.email = normalizedEmail;
    }

    const admin = await prisma.admin.update({
      where: { id: existing.id },
      data,
    });

    res.json({ ok: true, admin: formatAdmin(admin) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/password", async (req, res, next) => {
  try {
    const existing = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "Admin not found" });

    if (existing.id === req.admin.id) {
      return res.status(400).json({
        ok: false,
        error: "Use My Profile to change your own password",
      });
    }

    const { password } = req.body;
    const policy = validatePasswordStrength(password);
    if (!policy.ok) {
      return res.status(400).json({ ok: false, error: policy.error });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.update({
      where: { id: existing.id },
      data: { passwordHash },
    });

    await invalidateAdminSessions(existing.id);

    res.json({
      ok: true,
      admin: formatAdmin(admin),
      message: "Password reset. The admin must sign in with the new password.",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "Admin not found" });

    if (existing.id === req.admin.id) {
      return res.status(400).json({ ok: false, error: "You cannot delete your own account" });
    }

    if (existing.avatarUrl) {
      await deleteAdminAvatarFile(existing.avatarUrl);
    }

    await invalidateAdminSessions(existing.id);
    await prisma.admin.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
