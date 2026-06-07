import crypto from "crypto";
import { prisma } from "./prisma.js";

const SESSION_REFRESH_TTL_MS = 12 * 60 * 60 * 1000;
const REMEMBER_REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const adminSessionSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  tokenVersion: true,
  profileNote: true,
  passwordHash: true,
};

function hashRefreshToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function refreshTtlMs(rememberMe) {
  return rememberMe ? REMEMBER_REFRESH_TTL_MS : SESSION_REFRESH_TTL_MS;
}

export function createRawRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export async function issueAdminRefreshToken(adminId, rememberMe = false) {
  const rawToken = createRawRefreshToken();
  const expiresAt = new Date(Date.now() + refreshTtlMs(rememberMe));

  await prisma.adminRefreshToken.create({
    data: {
      adminId,
      tokenHash: hashRefreshToken(rawToken),
      rememberMe: Boolean(rememberMe),
      expiresAt,
    },
  });

  return {
    refreshToken: rawToken,
    expiresAt,
    rememberMe: Boolean(rememberMe),
    refreshExpiresIn: Math.floor(refreshTtlMs(rememberMe) / 1000),
  };
}

export async function verifyAdminRefreshToken(rawToken) {
  if (!rawToken) return null;

  const record = await prisma.adminRefreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(rawToken) },
    include: {
      admin: {
        select: adminSessionSelect,
      },
    },
  });

  if (!record || record.expiresAt <= new Date()) {
    if (record) {
      await prisma.adminRefreshToken.delete({ where: { id: record.id } }).catch(() => {});
    }
    return null;
  }

  return record;
}

export async function rotateAdminRefreshToken(rawToken) {
  const record = await verifyAdminRefreshToken(rawToken);
  if (!record) return null;

  const rememberMe = record.rememberMe;
  await prisma.adminRefreshToken.delete({ where: { id: record.id } });
  const next = await issueAdminRefreshToken(record.adminId, rememberMe);
  return { admin: record.admin, ...next };
}

export async function revokeAdminRefreshTokens(adminId) {
  await prisma.adminRefreshToken.deleteMany({ where: { adminId } });
}

export async function invalidateAdminSessions(adminId) {
  await prisma.$transaction([
    prisma.admin.update({
      where: { id: adminId },
      data: { tokenVersion: { increment: 1 } },
    }),
    prisma.adminRefreshToken.deleteMany({ where: { adminId } }),
  ]);
}

export const adminRefreshTokenConfig = {
  SESSION_REFRESH_TTL_MS,
  REMEMBER_REFRESH_TTL_MS,
};

export { adminSessionSelect };
