import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import {
  signAdminAccessToken,
  toAdminSession,
  adminAccessTokenTtlSeconds,
} from "../../lib/auth.js";
import {
  generateOtpCode,
  hashOtpCode,
  otpExpiresAt,
  canResendOtp,
  resendCooldownSeconds,
  passwordResetOtpConfig,
} from "../../lib/passwordResetOtp.js";
import { sendAdminPasswordResetOtp } from "../../lib/mail.js";
import {
  issueAdminRefreshToken,
  rotateAdminRefreshToken,
  invalidateAdminSessions,
  adminSessionSelect,
} from "../../lib/adminRefreshToken.js";
import {
  clearAdminLoginFailures,
  getAdminLoginLockout,
  recordAdminLoginFailure,
} from "../../lib/adminLoginLockout.js";
import { validatePasswordStrength } from "../../lib/passwordPolicy.js";
import { requireAdmin } from "../../middleware/admin.js";
import {
  adminLoginRateLimit,
  adminOtpRateLimit,
  adminRefreshRateLimit,
} from "../../middleware/adminRateLimit.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_OTP_MESSAGE = "If an admin account exists for this email, a verification code has been sent.";
const GENERIC_LOGIN_ERROR = "Invalid admin credentials";

async function buildAdminAuthResponse(admin, rememberMe = false) {
  const token = signAdminAccessToken(admin.id, admin.tokenVersion);
  const refresh = await issueAdminRefreshToken(admin.id, rememberMe);
  return {
    ok: true,
    token,
    refreshToken: refresh.refreshToken,
    expiresIn: adminAccessTokenTtlSeconds,
    refreshExpiresIn: refresh.refreshExpiresIn,
    rememberMe: refresh.rememberMe,
    user: toAdminSession(admin),
  };
}

router.post("/login", adminLoginRateLimit, async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const rememberMe = Boolean(req.body.rememberMe);

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }
    if (!password) {
      return res.status(400).json({ ok: false, error: "Password is required" });
    }

    const lockout = getAdminLoginLockout(email);
    if (lockout.locked) {
      return res.status(429).json({
        ok: false,
        error: "Too many failed attempts. Try again later.",
        retryAfterSeconds: lockout.retryAfterSeconds,
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: adminSessionSelect,
    });

    if (!admin?.passwordHash) {
      recordAdminLoginFailure(email);
      return res.status(401).json({ ok: false, error: GENERIC_LOGIN_ERROR });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      const failure = recordAdminLoginFailure(email);
      if (failure.locked) {
        return res.status(429).json({
          ok: false,
          error: "Too many failed attempts. Try again later.",
          retryAfterSeconds: failure.retryAfterSeconds,
        });
      }
      return res.status(401).json({ ok: false, error: GENERIC_LOGIN_ERROR });
    }

    clearAdminLoginFailures(email);
    res.json(await buildAdminAuthResponse(admin, rememberMe));
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", adminRefreshRateLimit, async (req, res, next) => {
  try {
    const refreshToken = String(req.body.refreshToken ?? "").trim();
    if (!refreshToken) {
      return res.status(400).json({ ok: false, error: "Refresh token is required" });
    }

    const rotated = await rotateAdminRefreshToken(refreshToken);
    if (!rotated?.admin) {
      return res.status(401).json({ ok: false, error: "Invalid or expired session" });
    }

    const token = signAdminAccessToken(rotated.admin.id, rotated.admin.tokenVersion);
    res.json({
      ok: true,
      token,
      refreshToken: rotated.refreshToken,
      expiresIn: adminAccessTokenTtlSeconds,
      refreshExpiresIn: rotated.refreshExpiresIn,
      rememberMe: rotated.rememberMe,
      user: toAdminSession(rotated.admin),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAdmin, async (req, res, next) => {
  try {
    await invalidateAdminSessions(req.admin.id);
    res.json({ ok: true, message: "Signed out successfully" });
  } catch (err) {
    next(err);
  }
});

router.patch("/password", requireAdmin, async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (!currentPassword) {
      return res.status(400).json({ ok: false, error: "Current password is required" });
    }

    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ ok: false, error: policy.error });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, passwordHash: true },
    });

    if (!admin?.passwordHash) {
      return res.status(400).json({ ok: false, error: "Password login is not available for this account" });
    }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      return res.status(400).json({ ok: false, error: "Current password is incorrect" });
    }

    const samePassword = await bcrypt.compare(newPassword, admin.passwordHash);
    if (samePassword) {
      return res.status(400).json({ ok: false, error: "Choose a different password than your current one" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });
    await invalidateAdminSessions(admin.id);

    res.json({
      ok: true,
      message: "Password updated. Please sign in again with your new password.",
    });
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

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, passwordHash: true },
    });

    const payload = { ok: true, message: GENERIC_OTP_MESSAGE };

    if (admin?.passwordHash) {
      const latest = await prisma.passwordResetOtp.findFirst({
        where: { email, purpose: passwordResetOtpConfig.OTP_PURPOSE, usedAt: null },
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
          purpose: passwordResetOtpConfig.OTP_PURPOSE,
          codeHash: hashOtpCode(code, email),
          expiresAt: otpExpiresAt(),
        },
      });

      const mailResult = await sendAdminPasswordResetOtp({
        email,
        fullName: admin.fullName,
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

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, email: true },
    });

    if (!admin?.passwordHash) {
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        purpose: passwordResetOtpConfig.OTP_PURPOSE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ ok: false, error: "Invalid or expired verification code" });
    }

    if (record.attempts >= passwordResetOtpConfig.MAX_ATTEMPTS) {
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
      prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    await invalidateAdminSessions(admin.id);

    res.json({ ok: true, message: "Password updated. You can sign in with your new password." });
  } catch (err) {
    next(err);
  }
});

export default router;
