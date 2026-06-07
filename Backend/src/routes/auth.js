import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken, toSessionUser } from "../lib/auth.js";
import { isEmailTaken } from "../lib/emailAvailability.js";
import {
  createEmailVerificationToken,
  getEmailVerificationResendCooldown,
  storefrontBaseUrl,
  verifyEmailVerificationToken,
} from "../lib/emailVerification.js";
import { sendCustomerEmailVerification, sendCustomerPasswordResetOtp } from "../lib/mail.js";
import { deleteUserAvatarFile } from "../lib/userAvatarFiles.js";
import {
  generateOtpCode,
  hashOtpCode,
  otpExpiresAt,
  canResendOtp,
  resendCooldownSeconds,
  customerPasswordResetOtpConfig,
} from "../lib/passwordResetOtp.js";
import { validatePasswordStrength } from "../lib/passwordPolicy.js";
import { adminOtpRateLimit } from "../middleware/adminRateLimit.js";

const router = Router();

const avatarUploadDir = path.resolve(process.cwd(), "uploads", "users");
fs.mkdirSync(avatarUploadDir, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      cb(null, `user-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const GENERIC_CUSTOMER_OTP_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

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
  else if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

async function sendVerificationEmailForUser(user) {
  const rawToken = await createEmailVerificationToken(user.id);
  const verifyUrl = `${storefrontBaseUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;
  return sendCustomerEmailVerification({
    email: user.email,
    fullName: user.fullName,
    verifyUrl,
  });
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

    let verificationEmailSent = false;
    try {
      await sendVerificationEmailForUser(user);
      verificationEmailSent = true;
    } catch (mailErr) {
      console.error("[auth] Failed to send verification email:", mailErr);
    }

    const token = signToken(user.id);
    res.status(201).json({
      ok: true,
      token,
      user: toSessionUser(user),
      hasPassword: true,
      emailVerified: false,
      verificationEmailSent,
      message: verificationEmailSent
        ? "Account created. Please check your email to verify your address before checkout."
        : "Account created. We could not send the verification email — use resend from your account.",
    });
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
    res.json({
      ok: true,
      token,
      user: toSessionUser(user),
      hasPassword: true,
      emailVerified: Boolean(user.emailVerifiedAt),
    });
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
          emailVerifiedAt: new Date(),
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
  res.json({
    ok: true,
    user: toSessionUser(req.user),
    hasPassword: Boolean(req.user.passwordHash),
    emailVerified: Boolean(req.user.emailVerifiedAt),
  });
});

router.post("/upload-avatar", requireAuth, avatarUpload.single("image"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Image file is required" });
    }
    res.status(201).json({
      ok: true,
      url: `/uploads/users/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const rawToken = req.body?.token ?? req.query?.token;
    if (!rawToken) {
      return res.status(400).json({ ok: false, error: "Verification token is required" });
    }

    const result = await verifyEmailVerificationToken(String(rawToken));
    if (!result.ok) {
      return res.status(400).json({ ok: false, error: result.error });
    }

    res.json({
      ok: true,
      user: toSessionUser(result.user),
      alreadyVerified: Boolean(result.alreadyVerified),
      message: result.alreadyVerified
        ? "Your email is already verified."
        : "Email verified successfully. You can now checkout.",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/resend-verification", requireAuth, async (req, res, next) => {
  try {
    if (req.user.emailVerifiedAt) {
      return res.json({ ok: true, alreadyVerified: true, message: "Your email is already verified." });
    }

    const retryAfterSeconds = await getEmailVerificationResendCooldown(req.user.id);
    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        ok: false,
        error: `Please wait ${retryAfterSeconds}s before requesting another email`,
        retryAfterSeconds,
      });
    }

    await sendVerificationEmailForUser(req.user);
    res.json({
      ok: true,
      verificationEmailSent: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const { fullName, email, phone, avatarUrl } = req.body;
    const nextEmail = email?.trim().toLowerCase();
    const data = {};

    if (fullName !== undefined) data.fullName = fullName.trim();
    if (nextEmail) {
      if (await isEmailTaken(nextEmail, { excludeUserId: req.user.id })) {
        return res.status(409).json({ ok: false, error: "Another account uses this email" });
      }
      data.email = nextEmail;
    }
    if (phone !== undefined) data.phone = phone.trim();

    if (avatarUrl !== undefined) {
      const nextAvatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
      data.avatarUrl = nextAvatarUrl;
      const previousAvatarUrl = req.user.avatarUrl ?? "";
      if (previousAvatarUrl && previousAvatarUrl !== nextAvatarUrl) {
        await deleteUserAvatarFile(previousAvatarUrl);
      }
    }

    const emailChanged = Boolean(nextEmail && nextEmail !== req.user.email);
    if (emailChanged) {
      data.emailVerifiedAt = null;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: data.fullName ?? req.user.fullName,
        email: data.email ?? req.user.email,
        phone: data.phone ?? req.user.phone,
        avatarUrl: data.avatarUrl ?? req.user.avatarUrl,
        ...(emailChanged ? { emailVerifiedAt: null } : {}),
      },
    });

    if (emailChanged && updated.provider === "local") {
      try {
        await sendVerificationEmailForUser(updated);
      } catch (mailErr) {
        console.error("[auth] Failed to send verification email after profile update:", mailErr);
      }
    }

    res.json({ ok: true, user: toSessionUser(updated) });
  } catch (err) {
    next(err);
  }
});

router.patch("/password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ ok: false, error: "New password must be at least 8 characters" });
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

router.post("/forgot-password/request-otp", adminOtpRateLimit, async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, passwordHash: true },
    });

    const payload = { ok: true, message: GENERIC_CUSTOMER_OTP_MESSAGE };

    if (user?.passwordHash) {
      const latest = await prisma.passwordResetOtp.findFirst({
        where: { email, purpose: customerPasswordResetOtpConfig.OTP_PURPOSE, usedAt: null },
        orderBy: { createdAt: "desc" },
      });

      if (latest && !canResendOtp(latest.createdAt)) {
        return res.status(429).json({
          ok: false,
          error: "Please wait before requesting another code.",
          retryAfterSeconds: resendCooldownSeconds(latest.createdAt),
        });
      }

      const code = generateOtpCode();
      await prisma.passwordResetOtp.create({
        data: {
          email,
          purpose: customerPasswordResetOtpConfig.OTP_PURPOSE,
          codeHash: hashOtpCode(code, email),
          expiresAt: otpExpiresAt(),
        },
      });

      const mailResult = await sendCustomerPasswordResetOtp({
        email,
        fullName: user.fullName,
        code,
      });

      if (mailResult.devLogged && process.env.NODE_ENV !== "production") {
        payload.devOtpLogged = true;
      }
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password/verify-otp", adminOtpRateLimit, async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();
    const newPassword = req.body.newPassword;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ ok: false, error: "Enter the 6-digit verification code" });
    }

    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ ok: false, error: policy.error });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, email: true },
    });

    if (!user?.passwordHash) {
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        purpose: customerPasswordResetOtpConfig.OTP_PURPOSE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    if (record.attempts >= customerPasswordResetOtpConfig.MAX_ATTEMPTS) {
      return res.status(429).json({ ok: false, error: "Too many attempts. Request a new code." });
    }

    const validOtp = record.codeHash === hashOtpCode(otp, email);
    if (!validOtp) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    res.json({ ok: true, message: "Your password has been updated successfully." });
  } catch (err) {
    next(err);
  }
});

router.post("/password/request-reset-otp", requireAuth, adminOtpRateLimit, async (req, res, next) => {
  try {
    const email = req.user.email.trim().toLowerCase();
    const latest = await prisma.passwordResetOtp.findFirst({
      where: { email, purpose: customerPasswordResetOtpConfig.OTP_PURPOSE, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (latest && !canResendOtp(latest.createdAt)) {
      return res.status(429).json({
        ok: false,
        error: "Please wait before requesting another code.",
        retryAfterSeconds: resendCooldownSeconds(latest.createdAt),
      });
    }

    const code = generateOtpCode();
    await prisma.passwordResetOtp.create({
      data: {
        email,
        purpose: customerPasswordResetOtpConfig.OTP_PURPOSE,
        codeHash: hashOtpCode(code, email),
        expiresAt: otpExpiresAt(),
      },
    });

    const mailResult = await sendCustomerPasswordResetOtp({
      email,
      fullName: req.user.fullName,
      code,
    });

    res.json({
      ok: true,
      message: "A verification code has been sent to your email.",
      devOtpLogged: Boolean(mailResult.devLogged && process.env.NODE_ENV !== "production"),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/password/verify-reset-otp", requireAuth, adminOtpRateLimit, async (req, res, next) => {
  try {
    const email = req.user.email.trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();
    const newPassword = req.body.newPassword;

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ ok: false, error: "Enter the 6-digit verification code" });
    }

    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ ok: false, error: policy.error });
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        purpose: customerPasswordResetOtpConfig.OTP_PURPOSE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    if (record.attempts >= customerPasswordResetOtpConfig.MAX_ATTEMPTS) {
      return res.status(429).json({ ok: false, error: "Too many attempts. Request a new code." });
    }

    const validOtp = record.codeHash === hashOtpCode(otp, email);
    if (!validOtp) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    res.json({ ok: true, message: "Your password has been updated successfully." });
  } catch (err) {
    next(err);
  }
});

router.delete("/account", requireAuth, async (req, res, next) => {
  try {
    if (req.user.avatarUrl) {
      await deleteUserAvatarFile(req.user.avatarUrl);
    }
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
