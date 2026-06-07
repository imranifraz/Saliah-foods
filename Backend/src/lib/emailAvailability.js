import { prisma } from "./prisma.js";

export async function isEmailTaken(email, { excludeUserId, excludeAdminId } = {}) {
  const normalized = email.trim().toLowerCase();
  const [user, admin] = await Promise.all([
    prisma.user.findFirst({
      where: {
        email: normalized,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
      select: { id: true },
    }),
    prisma.admin.findFirst({
      where: {
        email: normalized,
        ...(excludeAdminId ? { NOT: { id: excludeAdminId } } : {}),
      },
      select: { id: true },
    }),
  ]);

  return Boolean(user || admin);
}
