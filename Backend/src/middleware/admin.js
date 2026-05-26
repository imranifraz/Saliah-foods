import { verifyToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true, phone: true, role: true, dateOfBirth: true, profileNote: true, provider: true },
    });
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isAdmin = user.role === "admin" || (adminEmail && user.email === adminEmail);
    if (!isAdmin) {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}
