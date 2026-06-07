import { verifyAdminAccessToken, toAdminSession } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { adminSessionSelect } from "../lib/adminRefreshToken.js";

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }

  try {
    const payload = verifyAdminAccessToken(header.slice(7));
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: adminSessionSelect,
    });

    if (!admin) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }

    if (payload.tv !== admin.tokenVersion) {
      return res.status(401).json({ ok: false, error: "Session expired. Please sign in again." });
    }

    req.admin = admin;
    req.user = toAdminSession(admin);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}
