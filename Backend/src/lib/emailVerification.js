import crypto from "crypto";
import { prisma } from "./prisma.js";

const TOKEN_BYTES = 32;
const TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function pepper() {
  return process.env.JWT_SECRET ?? "dev-secret";
}

export function hashEmailVerificationToken(rawToken, userId) {
  return crypto.createHash("sha256").update(`${rawToken}:${userId}:${pepper()}`).digest("hex");
}

export function parseEmailVerificationToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") return null;
  const dot = rawToken.indexOf(".");
  if (dot <= 0) return null;
  const userId = rawToken.slice(0, dot);
  const secret = rawToken.slice(dot + 1);
  if (!userId || secret.length < TOKEN_BYTES * 2) return null;
  return { userId, secret, rawToken };
}

export async function createEmailVerificationToken(userId) {
  const secret = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const rawToken = `${userId}.${secret}`;
  const tokenHash = hashEmailVerificationToken(rawToken, userId);
  const expiresAt = new Date(Date.now() + TTL_MS);

  await prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

export async function verifyEmailVerificationToken(rawToken) {
  const parsed = parseEmailVerificationToken(rawToken);
  if (!parsed) return { ok: false, error: "Invalid verification link" };

  const tokenHash = hashEmailVerificationToken(parsed.rawToken, parsed.userId);
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: parsed.userId,
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return { ok: false, error: "This verification link is invalid or has expired" };
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user) {
    return { ok: false, error: "Account not found" };
  }

  if (user.emailVerifiedAt) {
    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return { ok: true, user, alreadyVerified: true };
  }

  const verifiedAt = new Date();
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: verifiedAt },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: verifiedAt },
    }),
    prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: verifiedAt },
    }),
  ]);

  return { ok: true, user: updatedUser, alreadyVerified: false };
}

export async function getEmailVerificationResendCooldown(userId) {
  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!latest) return 0;
  const elapsed = Date.now() - latest.createdAt.getTime();
  if (elapsed >= RESEND_COOLDOWN_MS) return 0;
  return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
}

export function storefrontBaseUrl() {
  const fromEnv = process.env.STOREFRONT_URL?.trim() || process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  return fromEnv || "http://localhost:5173";
}
